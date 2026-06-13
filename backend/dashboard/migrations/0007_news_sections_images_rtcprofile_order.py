# Generated manually — sync models with database

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0006_alter_rtcresource_resource_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='rtcprofile',
            name='order',
            field=models.PositiveIntegerField(
                default=2,
                help_text='Lower numbers appear first when listing RTC profiles.',
                verbose_name='Display order',
            ),
        ),
        migrations.AlterModelOptions(
            name='rtcprofile',
            options={
                'ordering': ['order', 'name'],
                'verbose_name': 'RTC Profile',
                'verbose_name_plural': 'RTC Profiles',
            },
        ),
        migrations.AddField(
            model_name='news',
            name='summary',
            field=models.TextField(blank=True, null=True, verbose_name='Summary'),
        ),
        migrations.AddField(
            model_name='news',
            name='order',
            field=models.PositiveIntegerField(
                default=1,
                help_text='Lower numbers appear first when listing news.',
                verbose_name='Display order',
            ),
        ),
        migrations.AddField(
            model_name='news',
            name='news_date',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AlterModelOptions(
            name='news',
            options={'ordering': ['order', '-created_at']},
        ),
        migrations.CreateModel(
            name='NewsSection',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('content', models.TextField(blank=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='news_images/sections/')),
                ('order', models.PositiveIntegerField(default=0, help_text='Order among siblings (same parent).')),
                ('news', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sections', to='dashboard.news')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='dashboard.newssection')),
            ],
            options={
                'ordering': ['order', 'id'],
            },
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
