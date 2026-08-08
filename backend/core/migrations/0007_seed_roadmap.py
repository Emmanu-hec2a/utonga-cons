from django.db import migrations

def seed_roadmap(apps, schema_editor):
    RoadmapMilestone = apps.get_model('core', 'RoadmapMilestone')
    
    # Clean out any old/default roadmap data to ensure a clean migration from local
    RoadmapMilestone.objects.all().delete()

    milestones = [
        {"title": "Hiking Trails Rework", "description": "", "status": "done", "category": "trails_garden", "phase": 1, "order": 1},
        {"title": "Wildlife Signage", "description": None, "status": "in_progress", "category": "trails_garden", "phase": 1, "order": 2},
        {"title": "Camp Accommodation Phase 1", "description": None, "status": "upcoming", "category": "camping_experiences", "phase": 1, "order": 3},
        {"title": "Online Reservation System", "description": None, "status": "upcoming", "category": "visibility_bookings", "phase": 1, "order": 4},
        {"title": "Luxury Eco-Cabins", "description": None, "status": "upcoming", "category": "infrastructure", "phase": 2, "order": 5}
    ]
    
    for m in milestones:
        RoadmapMilestone.objects.create(**m)

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0006_seed_gallery'), # Ensure this matches your previous migration
    ]

    operations = [
        migrations.RunPython(seed_roadmap),
    ]
