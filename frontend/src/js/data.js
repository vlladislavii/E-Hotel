// dashboard.js
export const stats = [
    { title: "Total Hotels", value: "3", change: "", icon: "hotel", color: "#3b82f6" },
    { title: "Available Rooms", value: "246", change: "68% occupancy", icon: "bed", color: "#22c55e" },
    { title: "Active Bookings", value: "196", change: "+15 today", icon: "users", color: "#a855f7" },
    { title: "Revenue Today", value: "$12,450", change: "+8.2%", icon: "dollar-sign", color: "#eab308" }
];

export const activity = [
    { guest: "John Smith", type: "Check-in", hotel: "Ocean View", time: "10:30 AM" },
    { guest: "Sarah Johnson", type: "Booking", hotel: "Mountain Lodge", time: "11:15 AM" }
];

export const upcomingCheckouts = [
    { id: 101, guest: "Robert Wilson", room: "302B", hotel: "Ocean View", time: "2:00 PM" },
    { id: 102, guest: "Alice Freeman", room: "115A", hotel: "Mountain Lodge", time: "3:30 PM" },
    { id: 103, guest: "Kevin Hart", room: "G12", hotel: "City Center", time: "4:00 PM" },
];

// hotel-catalog.js and booking.js
export const Hotels = [
    { 
        id: 1, 
        name: "Ocean View Resort",
        stars: 5, 
        address: "123 Beach Road, Miami, FL",
        services: [
            { id: "breakfast", name: "Breakfast", price: 15 },
            { id: "dinner", name: "Dinner", price: 25 },
            { id: "gym", name: "Gym Access", price: 10 }
        ]
    },
    { 
        id: 2, 
        name: "Mountain Lodge", 
        stars: 4,
        address: "456 Alpine Way, Aspen, CO", 
        services: [
            { id: "breakfast", name: "Breakfast", price: 12 },
            { id: "parking", name: "Valet Parking", price: 20 }
        ]
    },
    { 
        id: 3, 
        name: "City Center Hotel", 
        stars: 4,
        address: "789 Main St, New York, NY", 
        services: [
            { id: "internet", name: "High-Speed Internet", price: 10 },
            { id: "breakfast", name: "Breakfast", price: 18 }
        ]
    }
];

// search-availability.js and booking.js
export const Rooms = [
    { id: 1, hotelId: 1, hotelName: "Ocean View Resort", hotelStars: 5, roomType: "Single", roomNumber: "101", price: 150, location: "Miami, FL" },
    { id: 2, hotelId: 1, hotelName: "Ocean View Resort", hotelStars: 5, roomType: "Double", roomNumber: "205", price: 220, location: "Miami, FL" },
    { id: 3, hotelId: 2, hotelName: "Mountain Lodge", hotelStars: 4, roomType: "Single", roomNumber: "302", price: 130, location: "Aspen, CO" },
    { id: 4, hotelId: 2, hotelName: "Mountain Lodge", hotelStars: 4, roomType: "Double", roomNumber: "410", price: 200, location: "Aspen, CO" },
    { id: 5, hotelId: 3, hotelName: "City Center Hotel", hotelStars: 4, roomType: "Single", roomNumber: "502", price: 140, location: "New York, NY" },
    { id: 6, hotelId: 4, hotelName: "Beach Paradise", hotelStars: 5, roomType: "Double", roomNumber: "608", price: 250, location: "Malibu, CA" }
];

export const Bookings = [
    { id: "BK-2024-001",  guestName: "John Smith", personalId: "1234567890123", hotelName: "Ocean View Resort", roomNumber: "205", roomId: 1, from: "2026-03-20", to: "2026-03-25", status: "confirmed", coupon: "NONE", paid: 600, pricePerNight: 150},
    { id: "BK-2024-002", guestName: "Sarah Johnson", personalId: "9876543210987", hotelName: "Mountain Lodge", roomNumber: "302", roomId: 2, from: "2026-03-15", to: "2026-03-18", status: "checked-in", coupon: "WELCOME10", paid: 350, pricePerNight: 120},
    {  id: "BK-2024-003", guestName: "Mike Brown", personalId: "5556667778889", hotelName: "City Center Hotel", roomNumber: "502", roomId: 3, from: "2026-04-01", to: "2026-04-10", status: "checked-in", coupon: "NONE", paid: 420, pricePerNight: 140}
];
