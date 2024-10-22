const House = require("../models/House");

const getHouses = async (req, res) => {
  try {
    //   const page = parseInt(req.query.page) || 1;
    //   const limit = parseInt(req.query.limit) || 9; // Default limit is 9
    //   const skip = (page - 1) * limit;

    //   const brandFilter = req.query.brand
    //     ? { brand: { $in: req.query.brand.split(";") } }
    //     : {};

    //   const typeFilter = req.query.productType
    //     ? { productType: { $in: req.query.productType.split(";") } }
    //     : {};

    //   const filter = { ...brandFilter, ...typeFilter };

    //   const totalProducts = await Product.countDocuments(filter);
    //   const totalPages = Math.ceil(totalProducts / limit);

    const houses = await House.find().populate({
      path: 'reports',
      populate: {
        path: 'comments',
      }
    }).populate('employees');
    //   const products = await Product.find(filter)
    // .skip(skip)
    // .limit(limit);

    res.status(200).json(houses);
  } catch (err) {
    console.error("Error in getHouses:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const addHouse = async (request, response) => {
  try {
    const {
      street,
      city,
      state,
      zip,
      landlordName,
      landlordPhone,
      landlordEmail,
      numBeds,
      numMattresses,
      numTables,
      numChairs,
    } = request.body

    const address = `${street}, ${city}, ${state} ${zip}`

    const house = await House.create({
      address,
      landlordName,
      landlordPhone,
      landlordEmail,
      numBeds,
      numMattresses,
      numTables,
      numChairs,
    })

    response.status(200).json(house)
  }
  catch (error) {
    response.status(500).json(error)
  }
}

const deleteHouse = async (request, response) => {
  try {
    const { houseId } = request.params
    const house = await House.findByIdAndDelete(houseId)
    if (!house) {
      return response.status(404).json('House not found!')
    }
    response.status(200).json(house)
  }
  catch (error) {
    response.status(500).json(error)
  }
}

const getHouseById = async (request, response) => {
  try {
    const { houseId } = request.params
    const house = await House.findById(houseId).populate('employees').populate({
        path: 'reports',
        populate: {
            path: 'comments'
        }
    })
    if (!house) {
      return response.status(404).json('House not found!')
    }
    response.status(200).json(house)
  }
  catch (error) {
    response.status(500).json(error)
  }
}

module.exports = {
  getHouses,
  addHouse,
  deleteHouse,
  getHouseById,
}