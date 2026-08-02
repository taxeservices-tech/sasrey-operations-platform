import {
  Star,
  Quote,
} from "lucide-react";

const testimonials = [
  {
    name: "Sarah Williams",
    country: "United Kingdom",
    service: "Airport Transfer",
    review:
      "Excellent service from the moment we landed. Our driver was waiting at the airport, helped with our luggage and made the journey to our resort comfortable and stress-free.",
  },
  {
    name: "Michael Anderson",
    country: "United States",
    service: "Private Tour",
    review:
      "Professional, punctual and incredibly friendly. The private tour exceeded our expectations and we felt completely safe throughout the day.",
  },
  {
    name: "Jennifer Morgan",
    country: "Canada",
    service: "Round Trip Transfer",
    review:
      "Booking was simple, communication was excellent and the vehicle was spotless. I highly recommend SASREY for anyone visiting Jamaica.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-slate-50 py-28"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto mb-20 max-w-3xl text-center">

          <span className="rounded-full bg-sky-100 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Testimonials
          </span>

          <h2 className="mt-6 text-5xl font-black text-slate-900">
            Trusted by Travelers
            <br />
            From Around the World.
          </h2>

          <p className="mt-6 text-xl leading-8 text-slate-600">
            Creating memorable journeys through exceptional service,
            professional drivers and reliable transportation across Jamaica.
          </p>

        </div>

        {/* Cards */}

        <div className="grid gap-8 lg:grid-cols-3">

          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group rounded-3xl bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >

              <Quote
                size={42}
                className="text-sky-500"
              />

              <div className="mt-6 flex gap-1">

                {[1,2,3,4,5].map((star)=>(
                  <Star
                    key={star}
                    size={18}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}

              </div>

              <p className="mt-6 leading-8 text-slate-600 italic">
                "{testimonial.review}"
              </p>

              <div className="mt-8 border-t border-slate-200 pt-6">

                <h3 className="text-xl font-bold text-slate-900">
                  {testimonial.name}
                </h3>

                <p className="mt-1 text-sky-600">
                  {testimonial.country}
                </p>

                <span className="mt-4 inline-block rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
                  {testimonial.service}
                </span>

              </div>

            </div>
          ))}

        </div>

        {/* Bottom Stats */}

        <div className="mt-20 grid gap-8 text-center md:grid-cols-4">

          <div>
            <h3 className="text-5xl font-black text-sky-600">
              5★
            </h3>

            <p className="mt-2 text-slate-600">
              Customer Experience
            </p>
          </div>

          <div>
            <h3 className="text-5xl font-black text-sky-600">
              24/7
            </h3>

            <p className="mt-2 text-slate-600">
              Customer Support
            </p>
          </div>

          <div>
            <h3 className="text-5xl font-black text-sky-600">
              100%
            </h3>

            <p className="mt-2 text-slate-600">
              Private Transportation
            </p>
          </div>

          <div>
            <h3 className="text-5xl font-black text-sky-600">
              Island
            </h3>

            <p className="mt-2 text-slate-600">
              Wide Coverage
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}