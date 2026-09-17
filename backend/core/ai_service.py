import openai
from django.conf import settings
from django.db.models import Sum

class UtongaAIService:
    SYSTEM_PROMPT = """
    You are the Utonga Conservation Assistant, a knowledgeable and passionate representative of Utonga.
    Your goal is to help visitors understand our mission, explore our roadmap, and facilitate donations.

    CORE KNOWLEDGE:
    - Mission: Utonga is dedicated to high-fidelity conservation, bridging the gap between donors and real-world impact.
    - Location: Primarily focused on East Africa (Kenya) but with a global vision.
    - Donation Engine: We support global currencies, mobile money (KES/UGX e.t.c), and cards.
    - Features: We have an Explore Hub, a Gallery of real-world impact, and a detailed Roadmap.
    - Tone: Professional, cinematic, inspiring, and transparent. Use "we/us" when referring to Utonga.
    - $1 = 1 tree planted, 1 animal protected.

    INSTRUCTIONS:
    - If a user asks how to give, guide them to the [Give](/give) page.
    - If a user asks about progress, mention the [Roadmap](/roadmap).
    - If a user asks about images or impact, mention the [Explore Hub](/explore).
    - Keep responses concise (under 4 sentences unless asked for detail).
    - If a user asks for a question that requires a one-line response, just respond in one line.
    - Use **Markdown** for formatting:
        - Use **bold** for key terms, names, or numbers.
        - Use *italics* for emphasis.
        - Use bullet points for lists.
        - Use `---` for horizontal separators between different topics.
        - **IMPORTANT**: Use standard Markdown links like `[Link Text](/path)` to direct users to pages.
    - If you don't know something specific, invite them to contact the team.
    """

    def __init__(self):
        # Switched to NetMind Qwen API for high performance and low cost
        self.api_key = getattr(settings, 'NETMIND_API_KEY', None)
        
        if not self.api_key:
            self.client = None
            return

        try:
            self.client = openai.OpenAI(
                api_key=self.api_key,
                base_url="https://api.netmind.ai/inference-api/openai/v1"
            )
        except Exception:
            self.client = None

    def get_dynamic_context(self):
        """Fetches live data from the database to give the AI real-time awareness."""
        from .models import Donation, RoadmapMilestone
        from .weather_service import WeatherService
        
        try:
            # 1. Get Campaign Progress
            total_raised = Donation.objects.filter(status='completed').aggregate(Sum('amount'))['amount__sum'] or 0
            donation_count = Donation.objects.filter(status='completed').count()
            
            # 2. Get Roadmap Highlights
            roadmap = RoadmapMilestone.objects.all().order_by('order')
            roadmap_summary = "\n".join([f"- {item.title}: {item.status}" for item in roadmap[:5]])
            
            # 3. Get Live Weather
            weather = WeatherService.get_current_sanctuary_weather()
            weather_summary = f"{weather['temp']}°C, {weather['condition']}. Advisory: {weather['advisory']}"
        except Exception:
            total_raised = 0
            donation_count = 0
            roadmap_summary = "Roadmap data is being updated."
            weather_summary = "Ideal sanctuary conditions (24°C, Clear Skies)."

        return f"""
        LATEST LIVE DATA (Confidential for AI reference):
        - Total Raised to Date: ${total_raised:,.2f}
        - Successful Donations: {donation_count}
        - Current Weather at Sanctuary: {weather_summary}
        - Current Roadmap Focus:
        {roadmap_summary}
        
        CONTACT INFO:
        - Email: info@utongaconservation.org
        - Headquarters: East Africa
        """

    def get_response(self, message, history=None):
        if not self.client:
            return "I'm currently offline, but you can explore our Roadmap or Gallery to learn more about Utonga!"

        # Inject real-time site data into the prompt
        dynamic_context = self.get_dynamic_context()
        full_system_prompt = f"{self.SYSTEM_PROMPT}\n\n{dynamic_context}"

        messages = [{"role": "system", "content": full_system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": message})

        try:
            # Using DeepSeek V4.1 Flash via NetMind for high speed and reliability
            response = self.client.chat.completions.create(
                model="deepseek-ai/DeepSeek-V4.1-Flash",
                messages=messages,
                temperature=0.7,
                max_tokens=512
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"AI Error: {e}")
            return "I'm having a small technical hiccup. Feel free to browse our Explore Hub while I recover!"
