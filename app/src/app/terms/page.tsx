'use client';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-text mb-6">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none text-text">
        <p className="text-lg mb-4">Last Updated: August 5, 2025</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using Promptly's services ("Service"), you agree to be bound by these Terms of Service. 
            If you do not agree to these Terms, you may not use the Service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. Description of Service</h2>
          <p>
            Promptly is a platform that enables users to share, discover, and rate AI prompts. 
            The Service includes features for creating an account, sharing prompts, commenting on others' prompts, 
            rating prompts, and following other users.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. User Accounts</h2>
          <p className="mb-3">
            To use certain features of the Service, you must create an account. You agree to provide accurate, 
            current, and complete information during the registration process and to update such information to 
            keep it accurate, current, and complete. You are responsible for safeguarding your password and for 
            all activities that occur under your account.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Content Guidelines</h2>
          <p className="mb-3">You agree not to post content that:</p>
          <ul className="list-disc pl-6 mb-3">
            <li className="mb-2">Is illegal, harmful, threatening, abusive, harassing, or defamatory</li>
            <li className="mb-2">Infringes on intellectual property rights of others</li>
            <li className="mb-2">Contains software viruses or harmful code</li>
            <li className="mb-2">Constitutes unauthorized advertising or spam</li>
            <li className="mb-2">Impersonates any person or entity</li>
          </ul>
          <p>
            We reserve the right, but have no obligation, to monitor or remove content that violates these guidelines.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">5. User Content Ownership</h2>
          <p>
            You retain ownership rights to the content you submit to the Service. By submitting content, 
            you grant us a worldwide, non-exclusive, royalty-free license to use, copy, modify, create derivative works from, 
            distribute, publicly display, and perform your content in connection with providing and promoting the Service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">6. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Promptly and are protected by 
            international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Promptly shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
            or any loss of data, use, goodwill, or other intangible losses, resulting from your access to or use of or 
            inability to access or use the Service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">8. Termination</h2>
          <p>
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or 
            liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">9. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, 
            we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            Email: terms@promptly.com
          </p>
        </section>
      </div>
    </div>
  );
}
