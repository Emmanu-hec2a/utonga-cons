import os
import io
import logging
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)

# Try registering GreatVibes calligraphic font if available
CALLIGRAPHY_FONT = "Times-BoldItalic"
font_path = os.path.join(settings.BASE_DIR, 'core', 'assets', 'fonts', 'GreatVibes.ttf')
if os.path.exists(font_path):
    try:
        pdfmetrics.registerFont(TTFont('GreatVibes', font_path))
        CALLIGRAPHY_FONT = 'GreatVibes'
    except Exception as e:
        logger.warning(f"Failed to register GreatVibes font: {e}")

class CertificationService:
    @staticmethod
    def generate_steward_certificate(donation):
        """
        Generates a high-fidelity 'Sanctuary Steward' certificate for a donor.
        Returns a BytesIO buffer containing the PDF data.
        """
        buffer = io.BytesIO()
        
        # Setup landscape A4
        width, height = landscape(A4)
        c = canvas.Canvas(buffer, pagesize=landscape(A4))
        
        # --- Background & Borders ---
        # Draw deep sanctuary green border
        c.setStrokeColor(colors.HexColor("#4A5D23"))
        c.setLineWidth(15)
        c.rect(20, 20, width - 40, height - 40)
        
        # Draw inner thin gold/accent border
        c.setStrokeColor(colors.HexColor("#C5A059")) # A subtle gold/wheat color
        c.setLineWidth(2)
        c.rect(35, 35, width - 70, height - 70)

        # --- Header ---
        c.setFillColor(colors.HexColor("#4A5D23"))
        c.setFont("Helvetica-Bold", 40)
        c.drawCentredString(width / 2, height - 120, "SANCTUARY STEWARD")
        
        c.setFont("Helvetica", 14)
        c.setFillColor(colors.black)
        c.drawCentredString(width / 2, height - 160, "OFFICIAL RECOGNITION OF CONSERVATION IMPACT")

        # --- Body ---
        c.setFont("Helvetica-Oblique", 18)
        c.drawCentredString(width / 2, height - 230, "This is to certify that")
        
        # Donor / Visitor Name (Calligraphic Script Font)
        # Convert donor name to title case for beautiful calligraphy rendering
        raw_name = str(donation.donor_name).strip()
        donor_name = raw_name.title() if raw_name else "Valued Sanctuary Steward"
        
        name_font_size = 54
        if len(donor_name) > 22: name_font_size = 42
        if len(donor_name) > 32: name_font_size = 32
        
        c.setFont(CALLIGRAPHY_FONT, name_font_size)
        c.setFillColor(colors.HexColor("#1A1A1A"))
        c.drawCentredString(width / 2, height - 295, donor_name)
        
        c.setFont("Helvetica", 16)
        c.setFillColor(colors.black)
        c.drawCentredString(width / 2, height - 355, "has successfully contributed to the restoration of Utonga Sanctuary by planting")
        
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(colors.HexColor("#4A5D23"))
        try:
            tree_count = int(float(donation.amount))
        except (ValueError, TypeError):
            tree_count = 0
            
        c.drawCentredString(width / 2, height - 395, f"{tree_count} INDIGENOUS { 'TREE' if tree_count == 1 else 'TREES' }")

        c.setFont("Helvetica", 13)
        c.setFillColor(colors.gray)
        issue_date = donation.created_at.strftime('%B %d, %Y') if hasattr(donation, 'created_at') and donation.created_at else timezone.now().strftime('%B %d, %Y')
        c.drawCentredString(width / 2, height - 435, f"Issued on this day, {issue_date}")

        # --- Signatures ---
        # Left Signature: Chairperson
        c.setStrokeColor(colors.black)
        c.setLineWidth(1)
        c.line(130, 100, 330, 100)
        c.setFont(CALLIGRAPHY_FONT, 26)
        c.setFillColor(colors.black)
        c.drawCentredString(230, 112, "J. Ongolo")
        
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(230, 84, "MR. JOSEPH ONGOLO")
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(colors.HexColor("#4A5D23"))
        c.drawCentredString(230, 71, "CHAIRPERSON")

        # Right Signature: Treasurer
        c.setStrokeColor(colors.black)
        c.setLineWidth(1)
        c.line(width - 330, 100, width - 130, 100)
        c.setFont(CALLIGRAPHY_FONT, 26)
        c.setFillColor(colors.black)
        c.drawCentredString(width - 230, 112, "E. Flyckt")
        
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(width - 230, 84, "MS. EUNICE FLYCKT")
        c.setFont("Helvetica-Bold", 9)
        c.setFillColor(colors.HexColor("#4A5D23"))
        c.drawCentredString(width - 230, 71, "TREASURER")

        # --- QR Verification ---
        qr_data = f"{getattr(settings, 'UTONGA_PRIMARY_DOMAIN', 'https://utonga.org')}/verify/{donation.id}"
        qr = qrcode.QRCode(box_size=2)
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        qr_buffer = io.BytesIO()
        qr_img.save(qr_buffer, format='PNG')
        qr_buffer.seek(0)
        
        from reportlab.lib.utils import ImageReader
        c.drawImage(ImageReader(qr_buffer), (width/2) - 25, 55, width=50, height=50)
        
        c.setFont("Helvetica", 8)
        c.setFillColor(colors.gray)
        c.drawCentredString(width/2, 42, f"Sanctuary ID: UTG-{donation.id}-{int(donation.created_at.timestamp() if hasattr(donation, 'created_at') and donation.created_at else timezone.now().timestamp())}")

        c.showPage()
        c.save()
        
        buffer.seek(0)
        return buffer
