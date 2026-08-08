from django.db import migrations

def seed_gallery(apps, schema_editor):
    GalleryImage = apps.get_model('core', 'GalleryImage')
    
    # Only seed if the gallery is empty
    if GalleryImage.objects.count() == 0:
        images = [
            { "title": "Forest Trail", "category": "trail", "image_key": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071", "order": 1 },
            { "title": "Wetland Sanctuary", "category": "wetland", "image_key": "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070", "order": 2 },
            { "title": "Hippo Point", "category": "hippo", "image_key": "https://images.unsplash.com/photo-1544198365-f5d60b6d8190?q=80&w=2070", "order": 3 },
            { "title": "Botanical Garden", "category": "garden", "image_key": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1932", "order": 4 },
            { "title": "Camp Site", "category": "camp", "image_key": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2070", "order": 5 },
            { "title": "Lakeside Sunset", "category": "wetland", "image_key": "https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?q=80&w=2070", "order": 6 }
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
