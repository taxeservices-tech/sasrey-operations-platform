export default function Testimonials() {
  const reviews = [
    {
      name: "Sarah Williams",
      country: "USA",
      review:
        "Excellent airport transfer service. Our driver was waiting for us when we landed and made us feel welcome from the very beginning.",
    },
    {
      name: "Michael Brown",
      country: "Canada",
      review:
        "We booked a full-day tour with SASREY and it was the highlight of our vacation. Professional, friendly and always on time.",
    },
    {
      name: "Emma Johnson",
      country: "United Kingdom",
      review:
        "Clean vehicle, professional driver and outstanding customer service. I highly recommend SASREY for anyone visiting Jamaica.",
    },
  ];

  return (
    <section
      id="testimonials"
      className="bg-slate-50 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        <div className="mb-16 text-center">

          <h2 className="text-5xl font-bold text-gray-900">
            What Our Customers Say
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
            We're proud to provide exceptional transportation and tour
            experiences throughout Jamaica.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {reviews.map((review) => (
            <div
              key={review.name}
              className="rounded-3xl bg-white p-8 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="mb-6 text-3xl text-yellow-500">
                ⭐⭐⭐⭐⭐
              </div>

              <p className="leading-8 text-gray-600 italic">
                "{review.review}"
              </p>

              <div className="mt-8">

                <h3 className="text-xl font-bold">
                  {review.name}
                </h3>

                <p className="text-gray-500">
                  {review.country}
                </p>

              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}