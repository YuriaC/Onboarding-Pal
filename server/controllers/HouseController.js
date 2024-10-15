exports.getHouses = async (req, res) => {
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

    const houses = await House.find();
    //   const products = await Product.find(filter)
    // .skip(skip)
    // .limit(limit);

    res.status(200).json({
      houses,
    });
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    res.status(500).json({ message: "Server error" });
  }
};
