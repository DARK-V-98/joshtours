export interface Car {
  id: number;
  name: string;
  type: string;
  pricePerDay: number;
  image: string;
  dataAiHint: string;
  specs: {
    engine: string;
    transmission: "Automatic" | "Manual";
    seats: number;
    fuel: "Gasoline" | "Diesel" | "Electric";
  };
}

export const cars: Car[] = [
  {
    id: 1,
    name: "Toyota Corolla",
    type: "Sedan",
    pricePerDay: 75,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "white sedan",
    specs: {
      engine: "1.8L",
      transmission: "Automatic",
      seats: 5,
      fuel: "Gasoline",
    },
  },
  {
    id: 2,
    name: "Honda CR-V",
    type: "SUV",
    pricePerDay: 90,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "red suv",
    specs: {
      engine: "1.5L Turbo",
      transmission: "Automatic",
      seats: 5,
      fuel: "Gasoline",
    },
  },
  {
    id: 3,
    name: "Ford Mustang",
    type: "Sports Car",
    pricePerDay: 150,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "yellow sportscar",
    specs: {
      engine: "5.0L V8",
      transmission: "Manual",
      seats: 4,
      fuel: "Gasoline",
    },
  },
  {
    id: 4,
    name: "Tesla Model 3",
    type: "Electric",
    pricePerDay: 120,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "blue electric car",
    specs: {
      engine: "Dual Motor",
      transmission: "Automatic",
      seats: 5,
      fuel: "Electric",
    },
  },
  {
    id: 5,
    name: "Jeep Wrangler",
    type: "Off-road",
    pricePerDay: 110,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "green offroad jeep",
    specs: {
      engine: "3.6L V6",
      transmission: "Automatic",
      seats: 4,
      fuel: "Gasoline",
    },
  },
  {
    id: 6,
    name: "BMW 3 Series",
    type: "Luxury Sedan",
    pricePerDay: 135,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "black luxury sedan",
    specs: {
      engine: "2.0L Turbo",
      transmission: "Automatic",
      seats: 5,
      fuel: "Gasoline",
    },
  },
  {
    id: 7,
    name: "Kia Carnival",
    type: "Minivan",
    pricePerDay: 95,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "silver minivan",
    specs: {
      engine: "3.5L V6",
      transmission: "Automatic",
      seats: 8,
      fuel: "Gasoline",
    },
  },
  {
    id: 8,
    name: "Ford F-150",
    type: "Truck",
    pricePerDay: 125,
    image: "https://placehold.co/600x400.png",
    dataAiHint: "gray truck",
    specs: {
      engine: "3.5L EcoBoost",
      transmission: "Automatic",
      seats: 5,
      fuel: "Gasoline",
    },
  },
];
