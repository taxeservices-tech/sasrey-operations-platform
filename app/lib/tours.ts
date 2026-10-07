export type TourType =
  | "Private Tour"
  | "Full-Day Tour"
  | "Custom/Private Excursion";

export type TourPricingModel =
  | "fixed_service_price"
  | "dynamic_activity"
  | "custom";

export interface Tour {
  // Existing booking/pricing compatibility fields
  id: string;
  name: string;
  type: TourType;
  destination: string | null;
  attractions: string | null;
  durationMinutes: number | null;
  includedPassengers: number | null;
  additionalPassengerFee: number;
  maxPassengers: number | null;
  basePrice: number;
  currency: "USD";
  vehicle: string | null;
  active: boolean;
  notes: string;

  // New SASREY tour catalogue fields
  slug: string;
  destinationRegion: string;
  shortDescription: string;
  description: string;

  destinations: string[];
  stops: string[];
  itinerary: string[];

  pricingModel: TourPricingModel;
  priceLabel: string;

  included: string[];
  excluded: string[];

  admissionIncluded: boolean;
  mealsIncluded: boolean;
  personalExpensesIncluded: boolean;

  bookingNotes: string[];
  displayOrder: number;
}

export const tours: Tour[] = [
  {
    id: "OR-001",
    name: "Dunn's River Falls Adventure",
    slug: "dunns-river-falls-adventure",
    type: "Private Tour",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Dunn's River Falls & Park",

    shortDescription:
      "A private SASREY day trip from your pickup location to Dunn's River Falls in Ocho Rios.",

    description:
      "Enjoy a private SASREY tour to Dunn's River Falls & Park in Ocho Rios. Travel in a private Toyota Noah with a dedicated driver, enjoy convenient pickup and return transportation, and spend your day experiencing one of Jamaica's best-known natural attractions.",

    destinations: [
      "Customer pickup location",
      "Ocho Rios, St. Ann",
      "Dunn's River Falls & Park",
      "Customer return location",
    ],

    stops: [
      "Hotel, villa, Airbnb or agreed pickup location",
      "Dunn's River Falls & Park",
      "Return to original pickup location",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to Ocho Rios",
      "Visit Dunn's River Falls & Park",
      "Customer enjoys the attraction at their own pace",
      "Return transportation to the original pickup location",
    ],

    durationMinutes: 480,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 269,
    currency: "USD",

    pricingModel: "fixed_service_price",
    priceLabel: "US$269 per private group, up to 7 passengers",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Hotel, villa, Airbnb or agreed pickup",
      "Return transportation",
      "Transportation to and from Ocho Rios",
      "SASREY tour service",
    ],

    excluded: [
      "Dunn's River Falls admission",
      "Lunch and beverages",
      "Water shoes",
      "Lockers",
      "Optional activities",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Attraction admission is paid separately by the customer.",
      "Lunch and personal expenses are paid separately by the customer.",
      "Private vehicle capacity is limited to 7 passengers.",
    ],

    active: true,
    displayOrder: 1,

    notes:
      "Launch price. SASREY service/transportation price only. Attraction admission is not included.",
  },

  {
    id: "OR-002",
    name: "Blue Hole Adventure",
    slug: "blue-hole-adventure",
    type: "Private Tour",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Blue Hole / Island Gully Falls",

    shortDescription:
      "A private SASREY adventure to Blue Hole / Island Gully Falls in the Ocho Rios area.",

    description:
      "Travel privately with SASREY to Blue Hole / Island Gully Falls. Your private Toyota Noah and dedicated driver provide convenient transportation from your accommodation to the adventure and back.",

    destinations: [
      "Customer pickup location",
      "Ocho Rios, St. Ann",
      "Blue Hole / Island Gully Falls",
      "Customer return location",
    ],

    stops: [
      "Hotel, villa, Airbnb or agreed pickup location",
      "Blue Hole / Island Gully Falls",
      "Return to original pickup location",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to the Ocho Rios area",
      "Visit Blue Hole / Island Gully Falls",
      "Customer enjoys the attraction and activities",
      "Return transportation to the original pickup location",
    ],

    durationMinutes: 480,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 269,
    currency: "USD",

    pricingModel: "fixed_service_price",
    priceLabel: "US$269 per private group, up to 7 passengers",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Hotel, villa, Airbnb or agreed pickup",
      "Return transportation",
      "Transportation to and from the Ocho Rios area",
      "SASREY tour service",
    ],

    excluded: [
      "Blue Hole / Island Gully admission",
      "Lunch and beverages",
      "Water shoes",
      "Lockers",
      "Optional activities",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Attraction admission is paid separately by the customer.",
      "Customers are responsible for food and personal expenses.",
      "Private vehicle capacity is limited to 7 passengers.",
    ],

    active: true,
    displayOrder: 2,

    notes:
      "Launch price. SASREY service/transportation price only. Attraction admission is not included.",
  },

  {
    id: "OR-003",
    name: "Dunn's River Falls + Blue Hole",
    slug: "dunns-river-blue-hole",
    type: "Full-Day Tour",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Dunn's River Falls & Park; Blue Hole / Island Gully Falls",

    shortDescription:
      "Combine two of Ocho Rios' most popular adventure destinations in one private SASREY tour.",

    description:
      "Experience Dunn's River Falls and Blue Hole / Island Gully Falls on the same private Ocho Rios day trip. SASREY provides the private vehicle, driver, transportation between destinations and return transportation.",

    destinations: [
      "Customer pickup location",
      "Ocho Rios, St. Ann",
      "Blue Hole / Island Gully Falls",
      "Dunn's River Falls & Park",
      "Customer return location",
    ],

    stops: [
      "Customer pickup",
      "Blue Hole / Island Gully Falls",
      "Dunn's River Falls & Park",
      "Customer return",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to Ocho Rios",
      "Visit Blue Hole / Island Gully Falls",
      "Travel to Dunn's River Falls & Park",
      "Visit Dunn's River Falls & Park",
      "Return transportation to the original pickup location",
    ],

    durationMinutes: 600,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 379,
    currency: "USD",

    pricingModel: "fixed_service_price",
    priceLabel: "US$379 per private group, up to 7 passengers",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Hotel, villa, Airbnb or agreed pickup",
      "Transportation between the listed destinations",
      "Return transportation",
      "SASREY tour service",
    ],

    excluded: [
      "Blue Hole / Island Gully admission",
      "Dunn's River Falls admission",
      "Lunch and beverages",
      "Water shoes",
      "Lockers",
      "Optional activities",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Both attraction admissions are paid separately by the customer.",
      "Lunch and personal expenses are not included.",
      "Private vehicle capacity is limited to 7 passengers.",
    ],

    active: true,
    displayOrder: 3,

    notes:
      "Launch combination price. SASREY service/transportation price only. Attraction admissions are not included.",
  },

  {
    id: "OR-004",
    name: "Dolphin Cove — Dolphin Encounter",
    slug: "dolphin-cove-dolphin-encounter",
    type: "Private Tour",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Dolphin Cove Ocho Rios — Dolphin Encounter",

    shortDescription:
      "Private SASREY transportation to Dolphin Cove with the Dolphin Encounter selected separately.",

    description:
      "Travel privately to Dolphin Cove Ocho Rios and select the Dolphin Encounter experience for eligible participants. The SASREY transportation/service price is separate from the Dolphin Cove activity cost.",

    destinations: [
      "Customer pickup location",
      "Ocho Rios, St. Ann",
      "Dolphin Cove Ocho Rios",
      "Customer return location",
    ],

    stops: [
      "Customer pickup",
      "Dolphin Cove Ocho Rios",
      "Return to original pickup location",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to Dolphin Cove Ocho Rios",
      "Selected Dolphin Encounter",
      "Customer enjoys the attraction",
      "Return transportation",
    ],

    durationMinutes: 480,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 269,
    currency: "USD",

    pricingModel: "dynamic_activity",
    priceLabel: "From US$269 SASREY service + selected activity",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Pickup and return transportation",
      "Transportation to Dolphin Cove Ocho Rios",
      "SASREY tour service",
    ],

    excluded: [
      "Dolphin Cove admission/activity",
      "Food and beverages",
      "Photos and videos",
      "Optional purchases",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Dolphin Cove activity pricing is calculated separately.",
      "Participant eligibility must be confirmed before booking.",
      "The final customer price is calculated before checkout.",
    ],

    active: true,
    displayOrder: 4,

    notes:
      "Dynamic activity package. SASREY transportation/service price starts at US$269. Activity cost is calculated separately.",
  },

  {
    id: "OR-005",
    name: "Dolphin Cove — Swim Adventure",
    slug: "dolphin-cove-swim-adventure",
    type: "Private Tour",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Dolphin Cove Ocho Rios — Dolphin Swim Adventure",

    shortDescription:
      "Private SASREY transportation to Dolphin Cove with the Swim Adventure selected by the customer.",

    description:
      "Travel privately to Dolphin Cove Ocho Rios for the Dolphin Swim Adventure. The booking engine calculates the activity component separately based on the eligible participants.",

    destinations: [
      "Customer pickup location",
      "Ocho Rios, St. Ann",
      "Dolphin Cove Ocho Rios",
      "Customer return location",
    ],

    stops: [
      "Customer pickup",
      "Dolphin Cove Ocho Rios",
      "Return to original pickup location",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to Dolphin Cove",
      "Dolphin Swim Adventure",
      "Customer enjoys the attraction",
      "Return transportation",
    ],

    durationMinutes: 480,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 269,
    currency: "USD",

    pricingModel: "dynamic_activity",
    priceLabel: "From US$269 SASREY service + selected activity",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Pickup and return transportation",
      "Transportation to Dolphin Cove Ocho Rios",
      "SASREY tour service",
    ],

    excluded: [
      "Dolphin Cove Swim Adventure/activity fee",
      "Food and beverages",
      "Photos and videos",
      "Optional purchases",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Activity pricing is calculated separately.",
      "Participant eligibility must be confirmed.",
      "Exact total is shown before checkout.",
    ],

    active: true,
    displayOrder: 5,

    notes:
      "Dynamic activity package. SASREY transportation/service price starts at US$269.",
  },

  {
    id: "OR-006",
    name: "Dolphin Cove — Royal Swim",
    slug: "dolphin-cove-royal-swim",
    type: "Private Tour",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Dolphin Cove Ocho Rios — Royal Swim",

    shortDescription:
      "Private SASREY transportation to Dolphin Cove for the Royal Swim experience.",

    description:
      "Travel privately to Dolphin Cove Ocho Rios and select the Royal Swim experience for eligible participants. The SASREY service and activity pricing remain separate.",

    destinations: [
      "Customer pickup location",
      "Ocho Rios, St. Ann",
      "Dolphin Cove Ocho Rios",
      "Customer return location",
    ],

    stops: [
      "Customer pickup",
      "Dolphin Cove Ocho Rios",
      "Return to original pickup location",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to Dolphin Cove",
      "Royal Swim experience",
      "Customer enjoys the attraction",
      "Return transportation",
    ],

    durationMinutes: 480,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 269,
    currency: "USD",

    pricingModel: "dynamic_activity",
    priceLabel: "From US$269 SASREY service + selected activity",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Pickup and return transportation",
      "Transportation to Dolphin Cove Ocho Rios",
      "SASREY tour service",
    ],

    excluded: [
      "Dolphin Cove Royal Swim/activity fee",
      "Food and beverages",
      "Photos and videos",
      "Optional purchases",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Royal Swim eligibility requirements apply.",
      "Activity pricing is calculated separately.",
      "Exact total is shown before checkout.",
    ],

    active: true,
    displayOrder: 6,

    notes:
      "Dynamic activity package. SASREY transportation/service price starts at US$269.",
  },

  {
    id: "OR-007",
    name: "Dolphin Cove + Dunn's River",
    slug: "dolphin-cove-dunns-river",
    type: "Full-Day Tour",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions:
      "Dolphin Cove Ocho Rios; Dunn's River Falls & Park",

    shortDescription:
      "Combine a selected Dolphin Cove experience with Dunn's River Falls in one private Ocho Rios tour.",

    description:
      "Build a premium Ocho Rios day combining a selected Dolphin Cove experience with Dunn's River Falls. The booking engine calculates the Dolphin Cove activity separately while SASREY provides the private transportation and service.",

    destinations: [
      "Customer pickup location",
      "Ocho Rios, St. Ann",
      "Dolphin Cove Ocho Rios",
      "Dunn's River Falls & Park",
      "Customer return location",
    ],

    stops: [
      "Customer pickup",
      "Dolphin Cove Ocho Rios",
      "Dunn's River Falls & Park",
      "Customer return",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to Dolphin Cove",
      "Selected Dolphin Cove experience",
      "Transportation to Dunn's River Falls",
      "Visit Dunn's River Falls & Park",
      "Return transportation",
    ],

    durationMinutes: 660,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 379,
    currency: "USD",

    pricingModel: "dynamic_activity",
    priceLabel: "From US$379 SASREY service + selected activity",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Pickup and return transportation",
      "Transportation between listed destinations",
      "SASREY tour service",
    ],

    excluded: [
      "Dolphin Cove activity/admission",
      "Dunn's River Falls admission",
      "Lunch and beverages",
      "Water shoes",
      "Lockers",
      "Photos and videos",
      "Optional activities",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Customer selects the Dolphin Cove experience.",
      "Dolphin Cove activity pricing is calculated dynamically.",
      "Dunn's River admission is paid separately.",
      "Exact total is shown before checkout.",
    ],

    active: true,
    displayOrder: 7,

    notes:
      "Dynamic combination package. SASREY service starts at US$379. Attraction/activity costs are separate.",
  },

  {
    id: "OR-008",
    name: "Konoko Falls & Gardens",
    slug: "konoko-falls-gardens",
    type: "Private Tour",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Konoko Falls & Gardens",

    shortDescription:
      "A private SASREY tour to Konoko Falls & Gardens in Ocho Rios.",

    description:
      "Enjoy private transportation to Konoko Falls & Gardens with a dedicated SASREY driver. The package provides convenient pickup, transportation and return service while the attraction admission remains separate.",

    destinations: [
      "Customer pickup location",
      "Ocho Rios, St. Ann",
      "Konoko Falls & Gardens",
      "Customer return location",
    ],

    stops: [
      "Customer pickup",
      "Konoko Falls & Gardens",
      "Customer return",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to Konoko Falls & Gardens",
      "Customer enjoys the attraction",
      "Return transportation to the original pickup location",
    ],

    durationMinutes: 420,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 249,
    currency: "USD",

    pricingModel: "fixed_service_price",
    priceLabel: "US$249 per private group, up to 7 passengers",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Hotel, villa, Airbnb or agreed pickup",
      "Return transportation",
      "SASREY tour service",
    ],

    excluded: [
      "Konoko Falls & Gardens admission",
      "Lunch and beverages",
      "Optional activities",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Attraction admission is paid separately.",
      "Private vehicle capacity is limited to 7 passengers.",
    ],

    active: true,
    displayOrder: 8,

    notes:
      "Launch price. SASREY service/transportation price only. Admission is not included.",
  },

  {
    id: "OR-009",
    name: "Green Grotto Caves",
    slug: "green-grotto-caves",
    type: "Private Tour",

    destination: "Discovery Bay, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Green Grotto Caves",

    shortDescription:
      "A private SASREY tour to Green Grotto Caves in Discovery Bay, St. Ann.",

    description:
      "Travel privately from your accommodation to Green Grotto Caves in Discovery Bay. SASREY provides the vehicle, driver, pickup, transportation and return service.",

    destinations: [
      "Customer pickup location",
      "Discovery Bay, St. Ann",
      "Green Grotto Caves",
      "Customer return location",
    ],

    stops: [
      "Customer pickup",
      "Green Grotto Caves",
      "Customer return",
    ],

    itinerary: [
      "Pickup from the customer's selected location",
      "Private transportation to Discovery Bay",
      "Visit Green Grotto Caves",
      "Return transportation to the original pickup location",
    ],

    durationMinutes: 420,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 269,
    currency: "USD",

    pricingModel: "fixed_service_price",
    priceLabel: "US$269 per private group, up to 7 passengers",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Hotel, villa, Airbnb or agreed pickup",
      "Return transportation",
      "Transportation to Discovery Bay",
      "SASREY tour service",
    ],

    excluded: [
      "Green Grotto Caves admission",
      "Lunch and beverages",
      "Optional activities",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "Attraction admission is paid separately.",
      "Private vehicle capacity is limited to 7 passengers.",
    ],

    active: true,
    displayOrder: 9,

    notes:
      "Launch price. SASREY service/transportation price only. Admission is not included.",
  },

  {
    id: "OR-010",
    name: "Custom Ocho Rios Tour",
    slug: "custom-ocho-rios-tour",
    type: "Custom/Private Excursion",

    destination: "Ocho Rios, St. Ann",
    destinationRegion: "Ocho Rios",
    attractions: "Customer-selected destinations and stops",

    shortDescription:
      "Build your own private Ocho Rios experience by selecting the destinations and stops you want to visit.",

    description:
      "Create a custom Ocho Rios itinerary with SASREY. Select your preferred destinations, attractions and stops, choose your passengers and pickup location, and receive a calculated SASREY service price before checkout.",

    destinations: [
      "Customer-selected pickup location",
      "Customer-selected Ocho Rios destinations",
      "Customer-selected stops",
      "Customer return location",
    ],

    stops: [
      "Dunn's River Falls",
      "Blue Hole / Island Gully Falls",
      "Dolphin Cove",
      "Konoko Falls & Gardens",
      "Green Grotto Caves",
      "Ocho Rios town",
      "Shopping stop",
      "Restaurant/lunch stop",
      "Other approved customer-requested stops",
    ],

    itinerary: [
      "Customer selects pickup location",
      "Customer selects desired destinations and stops",
      "Pricing engine calculates the SASREY service price",
      "Customer reviews the proposed itinerary",
      "Customer books and pays online",
      "SASREY provides the private transportation and service",
      "Customer returns to the selected return location",
    ],

    durationMinutes: null,
    includedPassengers: 7,
    additionalPassengerFee: 0,
    maxPassengers: 7,

    basePrice: 450,
    currency: "USD",

    pricingModel: "custom",
    priceLabel: "From US$450 per private group",

    vehicle: "Toyota Noah Station Wagon",

    included: [
      "Private Toyota Noah transportation",
      "Professional SASREY driver",
      "Customer-selected itinerary within approved operating limits",
      "Transportation between selected stops",
      "Pickup and return transportation",
      "SASREY custom tour service",
    ],

    excluded: [
      "Attraction admission",
      "Activity fees",
      "Lunch and beverages",
      "Optional activities",
      "Souvenirs",
      "Tips",
      "Personal expenses",
    ],

    admissionIncluded: false,
    mealsIncluded: false,
    personalExpensesIncluded: false,

    bookingNotes: [
      "US$450 is a starting price, not a guaranteed final price.",
      "Final price depends on pickup location, destinations, stops, distance, duration and service requirements.",
      "The exact SASREY price is calculated before checkout.",
      "Attraction admissions and activity fees are paid separately unless a future package explicitly states otherwise.",
      "Private vehicle capacity is limited to 7 passengers.",
    ],

    active: true,
    displayOrder: 10,

    notes:
      "Custom pricing. Starting price is US$450. Final SASREY service price is calculated dynamically from the customer's selected itinerary.",
  },
];

export function getTourById(tourId: string): Tour | undefined {
  return tours.find((tour) => tour.id === tourId);
}

export function getActiveTours(): Tour[] {
  return tours
    .filter((tour) => tour.active)
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getToursByDestination(
  destinationRegion: string
): Tour[] {
  return getActiveTours().filter(
    (tour) => tour.destinationRegion === destinationRegion
  );
}