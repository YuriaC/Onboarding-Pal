const mongoose = require('mongoose');
const House = require('../models/House');
const User = require('../models/User');
const { faker } = require('@faker-js/faker')
const argon2 = require("argon2");

const MONGO_URI = process.env.MONGO_URI
const password = "Abcd1234@"

// console.log(MONGO_URI)

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB')

        const seed = async () => {
            await House.deleteMany({})
            await User.deleteMany({})

            let houses = []
            for (let i = 0; i < 5; i++) {
                houses.push({
                    address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()} ${faker.location.zipCode()}`,
                    landlordName: faker.person.fullName(),
                    landlordPhone: faker.phone.number(),
                    landlordEmail: faker.internet.email(),
                    numBeds: faker.number.int({ min: 0, max: 10 }),
                    numMattresses: faker.number.int({ min: 0, max: 10 }),
                    numTables: faker.number.int({ min: 0, max: 10 }),
                    numChairs: faker.number.int({ min: 0, max: 10 }),
                })
            }

            const hashedPassword = await argon2.hash(password); // THIS IS THE PASSWARD

            await House.insertMany(houses)
            const house = await House.findOne({}).exec();
            await User.insertMany([
                {
                    username: 'EmployeeTest',
                    email: "test1@gmail.com",
                    password: hashedPassword,
                    role: "employee",
                    house: house._id,
                  },
                  {
                    username: 'HRTest',
                    email: "test2@gmail.com",
                    password: hashedPassword,
                    role: "hr",
                  }
            ])
            const user = await User.findOne({}).lean().exec()
            house.employees.push(user._id)
            await house.save()
        
        }
        if (process.env.NODE_ENV !== 'production') {
            seed().then(() => console.log(`Successfully seeded with 5 house and 2 users: EmployeeTest and HRTest with password: ${password}`)).catch(error => console.log('Error seeding:', error.message))
        }

    })
    .catch(error => console.log('Error connecting to MongoDB:', error))

const db = mongoose.connection;

module.exports = db;
