# Generated manually

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0006_news_order'),
    ]

    operations = [
        migrations.AddField(
            model_name='news',
            name='summary',
            field=models.TextField(blank=True, null=True, verbose_name='Summary'),
        ),
        migrations.CreateModel(
            name='NewsImage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='news_images/extra/')),
                ('order', models.PositiveIntegerField(default=0)),
                ('news', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='extra_images', to='dashboard.news')),
            ],
            options={
                'ordering': ['order', 'id'],
            },
        ),
    ]
