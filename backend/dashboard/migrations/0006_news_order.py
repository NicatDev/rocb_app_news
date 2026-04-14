# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0005_news'),
    ]

    operations = [
        migrations.AddField(
            model_name='news',
            name='order',
            field=models.PositiveIntegerField(default=1),
        ),
    ]
