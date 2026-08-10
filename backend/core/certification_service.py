import os
import io
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from django.conf import settings
from django.utils import timezone

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
        c.drawCentredString(width / 2, height - 240, "This is to certify that")
        
        # Donor Name (Large & Bold)
        c.setFont("Helvetica-Bold", 48)
        c.setFillColor(colors.HexColor("#1A1A1A"))
        c.drawCentredString(width / 2, height - 300, donation.donor_name.upper())
        
        c.setFont("Helvetica", 18)
        c.setFillColor(colors.black)
        c.drawCentredString(width / 2, height - 360, f"has successfully contributed to the restoration of Utonga Sanctuary by planting")
        
        c.setFont("Helvetica-Bold", 24)
        c.setFillColor(colors.HexColor("#4A5D23"))
        tree_count = int(donation.amount) # Assuming $1 = 1 tree
        c.drawCentredString(width / 2, height - 400, f"{tree_count} INDIGENOUS TREES")

        c.setFont("Helvetica", 14)
        c.setFillColor(colors.gray)
        c.drawCentredString(width / 2, height - 440, f"Issued on this day, {timezone.now().strftime('%B %d, %Y')}")

        # --- Signatures ---
        # Left Signature (Scripted Look)
        c.setStrokeColor(colors.black)
        c.setLineWidth(1)
        c.line(150, 100, 350, 100)
        c.setFont("Times-BoldItalic", 20)
        c.setFillColor(colors.black)
        c.drawCentredString(250, 115, "E. Odongo")
        c.setFont("Helvetica", 10)
        c.drawCentredString(250, 85, "Director of Conservation")

        # Right Signature
        c.line(width - 350, 100, width - 150, 100)
        c.setFont("Times-BoldItalic", 20)
        c.drawCentredString(width - 250, 115, "J. Okello")
        c.setFont("Helvetica", 10)
        c.drawCentredString(width - 250, 85, "Sanctuary Operations")

        # --- QR Verification ---
        qr_data = f"{getattr(settings, 'UTONGA_PRIMARY_DOMAIN', 'https://utonga.org')}/verify/{donation.id}"
        qr = qrcode.QRCode(box_size=2)
        qr.add_data(qr_data)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert QR to reportlab image
        qr_buffer = io.BytesIO()
        qr_img.save(qr_buffer, format='PNG')
        qr_buffer.seek(0)
        
        from reportlab.lib.utils import ImageReader
        c.drawImage(ImageReader(qr_buffer), (width/2) - 30, 60, width=60, height=60)
        
        c.setFont("Helvetica", 8)
        c.drawCentredString(width/2, 50, f"Sanctuary ID: UTG-{donation.id}-{int(donation.created_at.timestamp())}")

        c.showPage()
        c.save()
        
        buffer.seek(0)
        return buffer
