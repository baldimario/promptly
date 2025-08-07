'use client';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      <h1 className="text-3xl font-bold text-text mb-6">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none text-text">
        <p className="text-lg mb-4">Last Updated: August 5, 2025</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
          <p>
            Welcome to Promptly ("we", "our", "us"). We respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
          <p className="mb-3">We collect several types of information, including:</p>
          <ul className="list-disc pl-6 mb-3">
            <li className="mb-2">
              <strong>Personal Information:</strong> Name, email address, and profile information you provide when creating an account.
            </li>
            <li className="mb-2">
              <strong>Content Information:</strong> Prompts, comments, and ratings you submit to the platform.
            </li>
            <li className="mb-2">
              <strong>Usage Information:</strong> How you interact with our service, including browsing behavior and features used.
            </li>
            <li className="mb-2">
              <strong>Technical Information:</strong> IP address, browser type, device information, and cookies.
            </li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
          <p className="mb-3">We use your information to:</p>
          <ul className="list-disc pl-6 mb-3">
            <li className="mb-2">Provide, maintain, and improve our services</li>
            <li className="mb-2">Create and manage your account</li>
            <li className="mb-2">Process transactions</li>
            <li className="mb-2">Send you notifications, updates, and support messages</li>
            <li className="mb-2">Personalize your experience</li>
            <li className="mb-2">Analyze usage patterns to improve our service</li>
            <li className="mb-2">Comply with legal obligations</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">4. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our service and hold certain information. 
            Cookies are files with small amount of data which may include an anonymous unique identifier. 
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">5. Data Sharing and Disclosure</h2>
          <p className="mb-3">We may share your information with:</p>
          <ul className="list-disc pl-6 mb-3">
            <li className="mb-2">Service providers who perform services for us</li>
            <li className="mb-2">Other users, when you share prompts or interact with the community</li>
            <li className="mb-2">Legal authorities when required by law</li>
            <li className="mb-2">Third parties in connection with a merger, sale, or acquisition</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">6. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. 
            However, no method of transmission over the Internet or electronic storage is 100% secure, 
            and we cannot guarantee absolute security.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">7. Your Data Rights</h2>
          <p className="mb-3">Depending on your location, you may have rights to:</p>
          <ul className="list-disc pl-6 mb-3">
            <li className="mb-2">Access personal data we hold about you</li>
            <li className="mb-2">Request correction of your personal data</li>
            <li className="mb-2">Request deletion of your personal data</li>
            <li className="mb-2">Object to processing of your personal data</li>
            <li className="mb-2">Request restriction of processing your personal data</li>
            <li className="mb-2">Request transfer of your personal data</li>
            <li className="mb-2">Withdraw consent</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">8. Children's Privacy</h2>
          <p>
            Our service is not intended for individuals under the age of 13. 
            We do not knowingly collect personal information from children under 13. 
            If we discover that a child under 13 has provided us with personal information, 
            we will delete it immediately.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">9. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last Updated" date. 
            We encourage you to review this Privacy Policy periodically.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-3">10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: privacy@promptly.com
          </p>
        </section>
      </div>
    </div>
  );
}
