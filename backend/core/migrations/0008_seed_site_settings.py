from django.db import migrations

def seed_settings(apps, schema_editor):
    SiteSetting = apps.get_model('core', 'SiteSetting')
    
    # Only seed if empty
    if SiteSetting.objects.count() == 0:
        settings = [
            {"key": "official_phone", "value": "+254 718 258 821", "description": "Primary sanctuary contact number"},
            {"key": "official_email", "value": "sanctuary@utonga.org", "description": "Public inquiry email"},
            {"key": "location_coordinates", "value": "-0.0917, 34.7680", "description": "Sitatunga Sanctuary HQ Coordinates"},
            {"key": "transparency_report_url", "value": "https://utonga.org/reports/2024", "description": "Link to the latest impact report"}
        ]
        
        for s in settings:
            SiteSetting.objects.create(**s)

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0007_seed_roadmap'), # Dependency on the roadmap seed
    ]

    operations = [
        migrations.RunPython(seed_settings),
    ]
