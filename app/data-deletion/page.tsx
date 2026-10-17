export default function DataDeletionPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-gray-800">
      <h1 className="mb-2 text-3xl font-bold">
        Data Deletion Instructions
      </h1>

      <p className="mb-8 text-sm text-gray-500">
        Last updated: October 16, 2026
      </p>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">
          1. Requesting deletion of your personal information
        </h2>
        <p>
          SASREY Taxi Services &amp; Tours Limited (“SASREY”) respects
          your privacy. You may request deletion of personal information
          that you have provided to us through booking enquiries,
          airport transfers, tours, or WhatsApp communications.
        </p>

        <h2 className="text-xl font-semibold">
          2. How to submit a request
        </h2>
        <p>
          To request deletion, contact SASREY using the contact details
          published on our official website at{" "}
          <a
            className="text-blue-600 underline"
            href="https://sasreytours.com"
          >
            sasreytours.com
          </a>
          . Include “Personal Data Deletion Request” in your message and
          tell us which contact details or booking information your
          request concerns.
        </p>
        <p>
          Please do not send passwords, payment card details, or other
          unnecessary sensitive information. We may need to verify your
          identity before processing a request.
        </p>

        <h2 className="text-xl font-semibold">
          3. What happens next
        </h2>
        <p>
          We will review your request and delete or anonymize eligible
          personal information where appropriate. We may retain certain
          records when required by law, for legitimate accounting
          purposes, to resolve disputes, or to protect against fraud.
          If any information must be retained, we will handle it in
          accordance with applicable requirements.
        </p>

        <h2 className="text-xl font-semibold">
          4. Information handled by other services
        </h2>
        <p>
          If you communicated with us through WhatsApp or another
          third-party service, you may also need to manage information
          held by that service through its own privacy and account
          settings.
        </p>

        <h2 className="text-xl font-semibold">
          5. Contact and privacy policy
        </h2>
        <p>
          For further information about how SASREY handles personal
          information, please read our{" "}
          <a
            className="text-blue-600 underline"
            href="https://sasreytours.com/privacy-policy"
          >
            Privacy Policy
          </a>
          .
        </p>
      </section>
    </main>
  );
}