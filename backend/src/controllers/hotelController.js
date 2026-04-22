const { Hotel, Service } = require('../models');

exports.getAllHotels = async (req, res) => {
    try {
        const hotels = await Hotel.findAll({
            include: [{
                model: Service,
                as: 'hotelServices'
            }]
        });
        res.status(200).json(hotels);
    } catch (error) {
        res.status(500).json({ message: "Error: ", error: error.message });
    }
};

exports.getHotelServices = async (req, res) => {
    try {
        const { id } = req.params;
        const services = await Service.findAll({
            where: { hotelId: id }
        });
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Error: ", error: error.message });
    }
};