from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0005_news'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rtcprofile',
            name='contact_person_email',
            field=models.EmailField(
                blank=True,
                max_length=254,
                null=True,
                verbose_name='Contact Person Email',
            ),
        ),
    ]
