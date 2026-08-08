from django.db import migrations

def seed_gallery(apps, schema_editor):
    GalleryImage = apps.get_model('core', 'GalleryImage')
    
    # Clean out any old legacy images first to ensure a clean wildlife collection
    GalleryImage.objects.all().delete()

    images = [
        { "title": "Butterfly Sanctuary", "category": "trail", "image_key": "https://images.unsplash.com/photo-1598207981454-d849f4ac3a9e?q=70&w=1800", "order": 1 },
        { "title": "African Porcupine", "category": "hippo", "image_key": "https://images.unsplash.com/photo-1776509545709-78aa6c9fa5bc?q=70&w=1200", "order": 2 },
        { "title": "Indigenous Hippo", "category": "hippo", "image_key": "https://plus.unsplash.com/premium_photo-1661963467008-cc311b4a98ca?q=70&w=1800", "order": 3 },
        { "title": "Black Ants Trail", "category": "trail", "image_key": "https://plus.unsplash.com/premium_photo-1722811376945-2ee83126ffe6?q=70&w=1800", "order": 4 },
        { "title": "Guinea Fowl", "category": "hippo", "image_key": "https://images.unsplash.com/photo-1705723119182-054121c14b85?q=70&w=1200", "order": 5 },
        { "title": "Forest Monkey", "category": "trail", "image_key": "https://images.unsplash.com/photo-1570275887572-34b431333fec?q=70&w=1800", "order": 6 }
    ]
    
    for img in images:
        GalleryImage.objects.create(**img)

class Migration(migrations.Migration):
    dependencies = [
        ('core', '0005_roadmapmilestone_description'), # Corrected to existing parent node
    ]

    operations = [
        migrations.RunPython(seed_gallery),
    ]
