from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from dashboard.models import RTCProfile, RTCResource, RTCEvent, RTCProject, GalleryImage, News
from feed.models import RTCPost
from django.utils import timezone
from datetime import timedelta
from django.core.files.base import ContentFile
from io import BytesIO
from PIL import Image, ImageDraw

User = get_user_model()

def generate_flag(color1, color2, color3, name):
    img = Image.new('RGB', (300, 200), color='white')
    draw = ImageDraw.Draw(img)
    height = 200 // 3
    draw.rectangle([0, 0, 300, height], fill=color1)
    draw.rectangle([0, height, 300, height*2], fill=color2)
    draw.rectangle([0, height*2, 300, 200], fill=color3)
    
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    return ContentFile(buffer.getvalue(), name=f'{name}.png')

class Command(BaseCommand):
    help = 'Seeds the database with 2 RTC profiles and related data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # 1. RTC Baku (Azerbaijan flag colors: Blue, Red, Green)
        admin1, _ = User.objects.get_or_create(username='rtc_admin_baku', email='baku@rocb.org', defaults={'first_name': 'Ali', 'last_name': 'Aliyev'})
        if not admin1.check_password('password123'):
            admin1.set_password('password123')
            admin1.save()

        rtc1, created1 = RTCProfile.objects.get_or_create(
            name='RTC Baku',
            defaults={
                'owner': admin1,
                'host_country': 'Azerbaijan',
                'address': '123 Heydar Aliyev Avenue, Baku, Azerbaijan',
                'website': 'https://customs.gov.az/en/',
                'coordinates': '40.4093, 49.8671',
                'director_name': 'Mr. Director Baku',
                'director_email': 'director@baku-rtc.org',
                'contact_person_name': 'Ms. Contact Baku',
                'contact_person_email': 'contact@baku-rtc.org',
                'phone_number': '+994 12 123 45 67',
                'establishment_year': 2005,
                'mission_statement': 'To provide high-quality training for customs officers in the region.',
                'overview_text': 'RTC Baku has been a center of excellence for customs training since 2005, focusing on drug enforcement and canine training.',
                'specialization_areas': 'Drug Enforcement, Canine Training, Risk Management',
                'status': 'PUBLIC'
            }
        )
        # Always update logo for demo purposes if not present or to force update
        if not rtc1.logo:
            flag_img = generate_flag('#00B5E2', '#EF3340', '#509E2F', 'baku_flag') # Aze flag approx colors
            rtc1.logo.save('baku_flag.png', flag_img, save=True)
            self.stdout.write(f'Updated logo for RTC: {rtc1.name}')

        if created1:
            self.stdout.write(f'Created RTC: {rtc1.name}')
            # Add fake resources
            RTCResource.objects.create(rtc=rtc1, title='Annual Plan 2024', resource_type='PLAN', status='PUBLIC', description='Training plan for 2024')
            RTCResource.objects.create(rtc=rtc1, title='Strategic Plan 2023-2025', resource_type='STRATEGY', status='PUBLIC', external_link='https://example.com/strategy')
            
            # Add fake events
            RTCEvent.objects.create(rtc=rtc1, title='K9 Training Workshop', topic='Enforcement', start_date=timezone.now().date() + timedelta(days=30), status='PUBLIC')
            RTCEvent.objects.create(rtc=rtc1, title='Risk Management Seminar', topic='Risk', start_date=timezone.now().date() - timedelta(days=10), end_date=timezone.now().date() - timedelta(days=8), summary='Successful seminar with 50 participants', participant_count=50, status='PUBLIC')

             # Add fake projects
            RTCProject.objects.create(rtc=rtc1, name='Border Security Initiative', description='Enhancing border security through technology', timeframe='2024-2026', partners='WCO, UNODC', status='PUBLIC')

        
        # 2. RTC Budapest (Hungary flag colors: Red, White, Green)
        admin2, _ = User.objects.get_or_create(username='rtc_admin_budapest', email='budapest@rocb.org', defaults={'first_name': 'Janos', 'last_name': 'Kovacs'})
        if not admin2.check_password('password123'):
            admin2.set_password('password123')
            admin2.save()

        rtc2, created2 = RTCProfile.objects.get_or_create(
            name='RTC Budapest',
            defaults={
                'owner': admin2,
                'host_country': 'Hungary',
                'address': '456 Danube Street, Budapest, Hungary',
                'website': 'https://en.nav.gov.hu/',
                'coordinates': '47.4979, 19.0402',
                'director_name': 'Ms. Director Budapest',
                'director_email': 'director@budapest-rtc.org',
                'director_bio': 'Ms. Director has over 20 years of experience in customs administration implies a strong background in international trade law and border security management.',
                'contact_person_name': 'Mr. Contact Budapest',
                'contact_person_email': 'contact@budapest-rtc.org',
                'phone_number': '+36 1 123 4567',
                'establishment_year': 2010,
                'mission_statement': 'Fostering cooperation and knowledge sharing among customs administrations.',
                'overview_text': 'RTC Budapest specializes in tax and customs cooperation, offering courses on EU regulations and digital customs.',
                'specialization_areas': 'EU Regulations, Digital Customs, Tax Cooperation',
                'status': 'PUBLIC'
            }
        )
        
        if not rtc2.logo:
            flag_img = generate_flag('#CE2939', '#FFFFFF', '#477050', 'budapest_flag') # Hungary flag approx colors
            rtc2.logo.save('budapest_flag.png', flag_img, save=True)
            self.stdout.write(f'Updated logo for RTC: {rtc2.name}')

        if created2:
            self.stdout.write(f'Created RTC: {rtc2.name}')

            # Add fake resources (generating 12 for pagination test)
            resource_types = ['PLAN', 'REPORT', 'CATALOGUE', 'STRATEGY', 'PUB']
            for i in range(1, 13):
                r_type = resource_types[i % len(resource_types)]
                RTCResource.objects.create(
                    rtc=rtc2, 
                    title=f'Resource Document {i} - 2024', 
                    resource_type=r_type, 
                    status='PUBLIC', 
                    description=f'Description for resource {i}. This is a sample document providing valuable insights.',
                    external_link='https://example.com/resource' if i % 2 == 0 else None
                )
            
            # Add specific main ones
            RTCResource.objects.create(rtc=rtc2, title='Training Catalogue 2025', resource_type='CATALOGUE', status='PUBLIC', description='Upcoming courses list')
            
            # Add fake events
            RTCEvent.objects.create(rtc=rtc2, title='Digital Customs Conference', topic='Digitalization', event_date=timezone.now().date() + timedelta(days=60), status='PUBLIC')

            # Generate 9 more fake events for pagination
            event_topics = ['Enforcement', 'Trade Facilitation', 'Risk Management', 'Data Analysis', 'Leadership']
            for i in range(1, 10):
                topic = event_topics[i % len(event_topics)]
                event_date = timezone.now().date() + timedelta(days=i*15 - 45) # Some past, some future
                title = f'Workshop on {topic} #{i}'
                
                RTCEvent.objects.create(
                    rtc=rtc2,
                    title=title,
                    topic=topic,
                    event_date=event_date,
                    status='PUBLIC'
                )

            # Add fake posts
            RTCPost.objects.create(rtc=rtc2, author=admin2, title='New Training Facility Opened', content='We are proud to announce the opening of our new training facility...', status='PUBLIC')

        # Check and add projects if missing
        if RTCProject.objects.filter(rtc=rtc2).count() == 0:
            self.stdout.write('Seeding projects for RTC Budapest...')
            project_data = [
                ("Customs Modernization", "2023-2025", "World Bank, IMF", "Comprehensive modernization of customs procedures and infrastructure upgrade."),
                ("Green Customs Initiative", "2024-2027", "UNEP, WCO", "Implementing eco-friendly practices in border management and trade facilitation."),
                ("Digital Borders", "2024-2026", "EU Commission", "Implementation of advanced digital solutions for border control and data exchange."),
                ("Anti-Trafficking Program", "2023-2024", "UNODC, Interpol", "Joint operations and training to combat human trafficking and smuggling."),
                ("Trade Efficiency Project", "2025-2028", "WTO, local chambers", "Streamlining trade processes to reduce clearance times and costs."),
                ("K9 Unit Expansion", "2024-2025", "National Police", "Expanding canine units capabilities for drug and explosives detection."),
                ("Cybersecurity Shield", "2023-2026", "NATO CCDCOE", "Enhancing cybersecurity measures for customs data systems."),
                ("Risk Analysis AI", "2024-2027", "Tech Partners", "Developing AI-driven risk management tools for cargo screening."),
                ("Regional Data Hub", "2025-2030", "ROC-B Network", "Establishing a centralized data sharing platform for regional customs."),
                ("Integrity & Ethics", "2023-2024", "WCO Integrity Sub-Committee", "Promoting integrity and ethical standards within the customs administration."),
                ("Women in Customs", "2024-2026", "Gender Equality Agencies", "Empowering women in customs leadership roles through mentorship and training."),
                ("Single Window System", "2025-2029", "Government IT Dept", "Integrating all regulatory agencies into a single window system for trade.")
            ]

            for name, timeframe, partners, desc in project_data:
                RTCProject.objects.create(
                    rtc=rtc2,
                    name=name,
                    timeframe=timeframe,
                    partners=partners,
                    description=desc,
                    status='PUBLIC'
                )

        # Check and add gallery images if missing
        if GalleryImage.objects.filter(rtc=rtc2).count() == 0:
            self.stdout.write('Seeding gallery for RTC Budapest...')
            # Using placeholder images or reusing the flag for demo if no other images available
            # In a real scenario, we'd loop through actual files.
            # Here we will re-use the generated flag just to have SOMETHING in the gallery
            
            flag_img = generate_flag('#CE2939', '#FFFFFF', '#477050', 'budapest_flag_gallery')
            
            for i in range(1, 10):
                img_name = f'gallery_img_{i}.png'
                # Create a slight variation or just same img
                gallery_item = GalleryImage(rtc=rtc2, caption=f"Gallery Image {i} - Workshop Highlights")
                gallery_item.image.save(img_name, flag_img, save=True)

                gallery_item.image.save(img_name, flag_img, save=True)

        # Check and add News if missing
        if News.objects.count() == 0:
            self.stdout.write('Seeding News...')
            
            # Global News
            for i in range(1, 4):
                News.objects.create(
                    title=f'Global News Article {i}',
                    content=f'This is a global news article {i} relevant to all RTCs and the general public. It covers important updates from the WCO and ROCB.',
                    status='PUBLIC',
                    rtc=None
                )
            
            # RTC Baku News
            for i in range(1, 6):
                News.objects.create(
                    title=f'RTC Baku News Update {i}',
                    content=f'This is a specific news update for RTC Baku {i}. We have successfully completed the recent training cycle.',
                    status='PUBLIC',
                    rtc=rtc1
                )

            # RTC Budapest News
            # Specific long article for Insight 1
            News.objects.create(
                title='RTC Budapest Insight 1: Strategic Vision for 2026',
                content='''RTC Budapest is proud to announce its comprehensive Strategic Vision for 2026, marking a significant milestone in our commitment to excellence in customs administration training. This ambitious roadmap focuses on three core pillars: Digital Transformation, Cross-Border Cooperation, and Specialized Law Enforcement Training.

In the realm of Digital Transformation, we are launching a state-of-the-art e-learning platform that will utilize AI-driven adaptive learning technologies to personalize training paths for customs officers. This initiative aims to bridge the gap between traditional methods and the demands of a rapidly digitizing global trade environment.

Cross-Border Cooperation remains at the heart of our mission. We are expanding our joint training programs with neighboring RTCs and international organizations such as the WCO and UNODC. These collaborations will foster a unified approach to regional security and trade facilitation, ensuring that best practices are shared and implemented effectively across borders.

Finally, our Specialized Law Enforcement Training will see a robust expansion. We are introducing advanced courses in K9 handling, high-tech cargo scanning analysis, and financial crime investigation. By equipping officers with cutting-edge skills and tools, we aim to enhance the detection and prevention of illicit activities, thereby securing our borders and communities.

This strategic vision is not just a plan; it is a promise to our stakeholders and partners. We are dedicated to driving innovation and fostering a culture of continuous learning and improvement. Join us as we embark on this exciting journey towards a safer and more efficient future for customs administration.''',
                status='PUBLIC',
                rtc=rtc2
            )

            # 4 more generic insights
            for i in range(2, 6):
                News.objects.create(
                    title=f'RTC Budapest Insight {i}',
                    content=f'This is a specific news update for RTC Budapest {i}. Our new facility is fully operational.',
                    status='PUBLIC',
                    rtc=rtc2
                )

            # 10 Additional Fake News for Budapest with realistic headers
            budapest_news_data = [
                ("Advanced X-Ray Scanning Workshop", "Successfully concluded a 3-day workshop on the latest X-Ray scanning technologies for cargo inspection."),
                ("Regional K9 Competition Winners", "RTC Budapest K9 unit took top honors in the regional drug detection competition."),
                ("New Partnership with University of Public Service", "Signed an MOU to develop a specialized masters program in Customs Administration."),
                ("Green Customs: Eco-friendly Practices", "Implementing new guidelines for reducing carbon footprint in border operations."),
                ("Digital Customs Symposium 2025", "Hosting the annual symposium on the future of digital customs and data analytics."),
                ("Anti-Money Laundering Seminar", "Experts from across the EU gathered to discuss new trends in combating financial crimes."),
                ("Women in Customs Leadership Summit", "Empowering female officers through mentorship and leadership training programs."),
                ("Drone Surveillance Training", "Inaugurating the new drone pilot training course for border monitoring."),
                ("Intellectual Property Rights Workshop", "Focusing on identifying and seizing counterfeit goods at the border."),
                ("WCO Secretary General Visit", "Honored to host the WCO Secretary General for a tour of our facilities.")
            ]

            for title, desc in budapest_news_data:
                 News.objects.create(
                    title=title,
                    content=f"{desc} This event highlights our ongoing commitment to professional development and international standards. Participants praised the hands-on approach and the relevance of the topics discussed. We look forward to more such successful initiatives in the future.",
                    status='PUBLIC',
                    rtc=rtc2
                )

        self.stdout.write('Seeding completed successfully.')
