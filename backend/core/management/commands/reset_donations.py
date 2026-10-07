from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Sum
from core.models import Donation, Campaign, AuditLogEntry

class Command(BaseCommand):
    help = 'Resets test donation data from the database and recalculates campaign funds raised.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--all',
            action='store_true',
            help='Delete ALL donations from the database.',
        )
        parser.add_argument(
            '--test-only',
            action='store_true',
            help='Delete only donations marked with test references or test donor emails.',
        )
        parser.add_argument(
            '--yes',
            action='store_true',
            help='Skip interactive confirmation prompt.',
        )

    def handle(self, *args, **options):
        delete_all = options['all']
        test_only = options['test_only']
        skip_prompt = options['yes']

        if test_only:
            queryset = Donation.objects.filter(
                provider_reference__icontains='TEST'
            ) | Donation.objects.filter(
                donor_email__icontains='example.com'
            ) | Donation.objects.filter(
                donor_email__icontains='test'
            )
            mode_desc = "TEST donations only"
        else:
            queryset = Donation.objects.all()
            mode_desc = "ALL donation records"

        count = queryset.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No donation records found matching criteria."))
            return

        if not skip_prompt:
            self.stdout.write(self.style.WARNING(f"Targeting {count} donation record(s) [{mode_desc}]."))
            confirm = input("Are you sure you want to reset/delete these records? (y/N): ")
            if confirm.lower() not in ['y', 'yes']:
                self.stdout.write(self.style.NOTICE("Reset operation cancelled."))
                return

        with transaction.atomic():
            deleted_count, _ = queryset.delete()

            # Recalculate campaign raised_usd from remaining completed donations
            remaining_raised = Donation.objects.filter(status='completed').aggregate(
                total=Sum('amount')
            )['total'] or 0.00

            campaign = Campaign.objects.first()
            if campaign:
                campaign.raised_usd = remaining_raised
                campaign.save(update_fields=['raised_usd'])

            try:
                AuditLogEntry.objects.create(
                    action=f"Reset {deleted_count} donation records.",
                    model_name="Donation",
                    object_id="batch_reset",
                    changes={"deleted_records": deleted_count, "new_raised_usd": float(remaining_raised)}
                )
            except Exception as e:
                # Log warning if audit log creation fails (e.g. legacy DB column constraint)
                self.stdout.write(self.style.WARNING(f"Note: AuditLogEntry could not be saved ({e}). Reset proceeded successfully."))

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully removed {deleted_count} donation record(s).\n"
                f"Campaign raised_usd has been updated to ${remaining_raised}."
            )
        )
