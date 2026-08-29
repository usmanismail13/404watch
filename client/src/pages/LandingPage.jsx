function LandingPage() {
  return (
    <div className="landing-page">
      <h1 className="landing-title">
        404Watch — Website Monitoring
      </h1>

      <p className="landing-description">
        Automatically detect broken links and 404 errors before your
        customers do.
      </p>

      <a href="/this-page-does-not-exist-404">
        🚨 Test 404 Link
      </a>
    </div>
  );
}

export default LandingPage;
