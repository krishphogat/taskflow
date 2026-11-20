# generate_ppt.py
"""Create a simple PowerPoint presentation for the TaskFlow project.
This script uses the python-pptx library to generate a .pptx file with
- Project overview
- Architecture diagram (placeholder image)
- Screenshots of key UI pages (placeholder images)
- Tech stack summary
"""
import os
from pathlib import Path

# Ensure python-pptx is installed (install via pip if needed)
try:
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.enum.text import PP_ALIGN
except ImportError:
    import subprocess, sys
    subprocess.check_call([sys.executable, "-m", "pip", "install", "python-pptx"])
    from pptx import Presentation
    from pptx.util import Inches, Pt
    from pptx.enum.text import PP_ALIGN

# Paths for placeholder images – you can replace these with real screenshots later.
BASE_DIR = Path(__file__).parent
PLACEHOLDER_IMG = BASE_DIR / "placeholder.png"
# Create a simple placeholder image if it doesn't exist.
if not PLACEHOLDER_IMG.exists():
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        import subprocess, sys
        subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
        from PIL import Image, ImageDraw, ImageFont
    img = Image.new("RGB", (800, 600), (30, 30, 30))
    d = ImageDraw.Draw(img)
    f = ImageFont.load_default()
    d.text((200, 280), "Placeholder Image", fill=(200, 200, 200), font=f)
    img.save(PLACEHOLDER_IMG)

prs = Presentation()
# Title slide
title_slide_layout = prs.slide_layouts[0]
slide = prs.slides.add_slide(title_slide_layout)
title = slide.shapes.title
subtitle = slide.placeholders[1]
title.text = "TaskFlow – Full‑Stack Task Management App"
subtitle.text = "React • Node.js/Express • PostgreSQL"

# Overview slide
bullet_slide_layout = prs.slide_layouts[1]
slide = prs.slides.add_slide(bullet_slide_layout)
title = slide.shapes.title
title.text = "Project Overview"
body = slide.shapes.placeholders[1].text_frame
for point in [
    "A modern task‑management application",
    "User authentication with JWT",
    "CRUD for tasks, categories, and stats",
    "Responsive UI with glassmorphism design",
    "Docker‑ready for production",
]:
    p = body.add_paragraph()
    p.text = point
    p.level = 0

# Architecture slide (placeholder image)
slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
title_shape = slide.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(9), Inches(0.5))
title_tf = title_shape.text_frame
title_tf.text = "Architecture Diagram"
title_tf.paragraphs[0].font.size = Pt(24)
title_tf.paragraphs[0].alignment = PP_ALIGN.CENTER
pic = slide.shapes.add_picture(str(PLACEHOLDER_IMG), Inches(1), Inches(1.5), width=Inches(8))

# UI Screenshots slide – three placeholders
slide = prs.slides.add_slide(prs.slide_layouts[6])
title_shape = slide.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(9), Inches(0.5))
title_tf = title_shape.text_frame
title_tf.text = "Key UI Screens"
title_tf.paragraphs[0].font.size = Pt(24)
title_tf.paragraphs[0].alignment = PP_ALIGN.CENTER
# Add three placeholder images side by side
for i in range(3):
    left = Inches(0.5 + i * 3.2)
    slide.shapes.add_picture(str(PLACEHOLDER_IMG), left, Inches(1), width=Inches(3))

# Tech Stack slide
slide = prs.slides.add_slide(bullet_slide_layout)
title = slide.shapes.title
title.text = "Technology Stack"
body = slide.shapes.placeholders[1].text_frame
for line in [
    "Frontend: React (Vite) • TypeScript • CSS (glassmorphism)",
    "Backend: Node.js • Express • JWT • Bcrypt",
    "Database: PostgreSQL",
    "DevOps: Docker (optional) • GitHub CI/CD",
]:
    p = body.add_paragraph()
    p.text = line
    p.level = 0

# Save PPT
output_path = BASE_DIR / "TaskFlow_Presentation.pptx"
prs.save(str(output_path))
print(f"Presentation generated at {output_path}")
