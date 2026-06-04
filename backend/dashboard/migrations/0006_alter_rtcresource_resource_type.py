from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0005_news'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rtcresource',
            name='resource_type',
            field=models.CharField(
                choices=[
                    ('TOR', 'Mandate / Terms of Reference'),
                    ('MOU', 'Founding Memorandum'),
                    ('STRATEGY', 'Strategic Plan'),
                    ('PLAN', 'Annual Training Plan'),
                    ('CATALOGUE', 'Training Catalogue'),
                    ('REPORT', 'Annual Report / Newsletter'),
                    ('PUB', 'Publication / Handbook'),
                    ('ELEARN', 'E-Learning Link'),
                    ('PRESENTATION', 'RTC Presentation'),
                ],
                max_length=20,
            ),
        ),
    ]
