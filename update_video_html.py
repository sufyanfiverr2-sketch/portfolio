import re

with open('video.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Certificate Image
html = html.replace('certificate-editing-skool.png', 'certificate-new.png')

# 2. Update Tools Section
tools_section_pattern = r'<div class="tools-grid">.*?</div>\s*</div>\s*</section>'

new_tools_section = '''<div class="tools-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
          <div class="tool-card glass-card featured-tool">
            <div class="tool-badge-top">PRIMARY WORKHORSE</div>
            <div class="tool-logo" style="color: #000; background: #d4af37; border-color: #aa8c2c;">Dv</div>
            <h4>DaVinci Resolve Studio</h4>
            <p>My primary suite for long-form narrative editing, node-based cinematic color grading, Fairlight audio sweetening, and multi-track assembly.</p>
          </div>
  
          <div class="tool-card glass-card">
            <div class="tool-logo" style="color: #d4af37; border-color: #d4af37;">Ai</div>
            <h4>Higgsfield AI & Generative Video</h4>
            <p>Leveraging cutting-edge diffusion models like Higgsfield to generate impossible B-roll, animate still assets, and expand video canvas beyond original framing.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Editing with AI -->
    <section class="section section-alt" id="ai-editing">
      <div class="container">
        <div class="section-header">
          <p class="section-eyebrow">The Future of Post-Production</p>
          <h2 class="section-title">Video Editing with AI</h2>
          <p class="section-subtitle">Blending classical cinematic techniques with state-of-the-art AI generation to tell stories that were previously impossible.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 3rem;">
          <div class="focus-card glass-card">
            <div class="fc-icon">?</div>
            <h3 class="fc-title">Generative B-Roll</h3>
            <p>Using models like Higgsfield and Runway to generate ultra-realistic B-roll when stock footage falls short. I script precise prompts to create exact camera movements and lighting setups.</p>
          </div>

          <div class="focus-card glass-card">
            <div class="fc-icon">??</div>
            <h3 class="fc-title">Smart Workflows</h3>
            <p>Accelerating the assembly phase using AI-powered transcription editing, silence detection, and automated beat-syncing to focus human effort purely on the creative narrative.</p>
          </div>

          <div class="focus-card glass-card">
            <div class="fc-icon">??</div>
            <h3 class="fc-title">AI VFX & Restoration</h3>
            <p>Applying neural-engine tools for flawless object removal, generative expand (uncropping aspect ratios), and AI-upscaling low-resolution archive footage to 4K.</p>
          </div>
        </div>
      </div>
    </section>'''

html = re.sub(tools_section_pattern, new_tools_section, html, flags=re.DOTALL)

with open('video.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated video.html")
