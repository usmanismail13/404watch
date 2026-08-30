function LandingPage() {
  return (
    <main className="landing-page">
      {/* =========================
          Hero Section
      ========================= */}

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            🔍 Automatic 404 Monitoring
          </div>

          <h1 className="landing-title">
            Find Broken Links
            <span>Before Your Customers Do.</span>
          </h1>

          <p className="landing-description">
            404Watch automatically scans your website, detects broken links
            and 404 errors, and alerts you when something breaks.
          </p>

          <div className="hero-actions">
            <a href="/register" className="hero-primary-button">
              🚀 Start Monitoring
            </a>

            <a
              href="/this-page-does-not-exist-404"
              className="hero-secondary-button"
            >
              🚨 Test 404 Link
            </a>
          </div>

          <p className="hero-note">
            💰 Simple pricing — $10/month. No free tier.
          </p>
        </div>
      </section>

      {/* =========================
          How It Works
      ========================= */}

      <section className="how-it-works-section">
        <div className="how-it-works-content">
          <div className="section-heading">
            <p className="section-label">⚡ How It Works</p>

            <h2>Monitor your website in three simple steps.</h2>

            <p>
              404Watch handles the monitoring so you can focus on running
              your business.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>

              <div className="step-icon">🌐</div>

              <h3>Add Your Website</h3>

              <p>
                Add the website you want 404Watch to monitor from your
                dashboard.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>

              <div className="step-icon">🔍</div>

              <h3>We Scan Your Website</h3>

              <p>
                404Watch crawls your website and checks discovered links
                for broken pages and 404 errors.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>

              <div className="step-icon">🚨</div>

              <h3>Get Alerted</h3>

              <p>
                When a broken link is detected, 404Watch sends you an alert
                so you can fix it quickly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          Problem / Solution
      ========================= */}

      <section className="problem-solution-section">
        <div className="problem-solution-content">
          <div className="problem-content">
            <p className="section-label">🚨 The Problem</p>

            <h2>Broken links cost you customers.</h2>

            <p>
              Websites change constantly. Pages get deleted, URLs are
              updated, and links can quietly stop working.
            </p>

            <p>
              Without regular monitoring, your customers may discover those
              broken pages before you do.
            </p>
          </div>

          <div className="solution-content">
            <p className="section-label">✅ The Solution</p>

            <h2>404Watch finds them for you.</h2>

            <div className="solution-list">
              <div className="solution-item">
                <span>🔍</span>
                <p>Automatically scan your website for broken links.</p>
              </div>

              <div className="solution-item">
                <span>🚨</span>
                <p>Get notified when a 404 error is detected.</p>
              </div>

              <div className="solution-item">
                <span>🔄</span>
                <p>Know when previously broken pages recover.</p>
              </div>

              <div className="solution-item">
                <span>⏱️</span>
                <p>Fix problems before they affect your customers.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          Dashboard Preview
      ========================= */}

      <section className="dashboard-preview-section">
        <div className="dashboard-preview-content">
          <div className="section-heading">
            <p className="section-label">📊 Your Dashboard</p>

            <h2>See every broken link in one place.</h2>

            <p>
              Get a clear view of your website's 404 errors, recovered
              pages, and latest scan activity.
            </p>
          </div>

          <div className="dashboard-preview">
            <div className="preview-header">
              <div>
                <span className="preview-title">
                  📊 404Watch Dashboard
                </span>

                <span className="preview-status">
                  🟢 Monitoring
                </span>
              </div>

              <span className="preview-scan-time">
                Last scan: Just now
              </span>
            </div>

            <div className="preview-stats">
              <div className="preview-stat-card">
                <span className="preview-stat-icon">🚨</span>

                <span className="preview-stat-label">
                  Active 404s
                </span>

                <strong>12</strong>
              </div>

              <div className="preview-stat-card">
                <span className="preview-stat-icon">✅</span>

                <span className="preview-stat-label">
                  Recovered
                </span>

                <strong>8</strong>
              </div>

              <div className="preview-stat-card">
                <span className="preview-stat-icon">🔍</span>

                <span className="preview-stat-label">
                  Total Scans
                </span>

                <strong>24</strong>
              </div>
            </div>

            <div className="preview-errors">
              <div className="preview-errors-header">
                <h3>Recent 404 Errors</h3>

                <span>3 active</span>
              </div>

              <div className="preview-error-row">
                <div>
                  <strong>/products/old-product</strong>

                  <span>Source: /products</span>
                </div>

                <span className="preview-error-badge">
                  404
                </span>
              </div>

              <div className="preview-error-row">
                <div>
                  <strong>/blog/old-article</strong>

                  <span>Source: /blog</span>
                </div>

                <span className="preview-error-badge">
                  404
                </span>
              </div>

              <div className="preview-error-row">
                <div>
                  <strong>/pricing/legacy</strong>

                  <span>Source: /pricing</span>
                </div>

                <span className="preview-error-badge">
                  404
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          Final CTA
      ========================= */}

      <section className="final-cta-section">
        <div className="final-cta-content">
          <div className="final-cta-icon">
            🔍
          </div>

          <p className="section-label">
            🚀 Start Monitoring
          </p>

          <h2>
            Don't let broken links surprise your customers.
          </h2>

          <p>
            Start monitoring your website with 404Watch for just $10/month.
          </p>

          <div className="final-cta-actions">
            <a
              href="/register"
              className="hero-primary-button"
            >
              🚀 Start Monitoring
            </a>

            <a
              href="/pricing"
              className="hero-secondary-button"
            >
              💰 View Pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;