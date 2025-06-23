const mongoose = require('mongoose');
const House = require('../models/House');
const User = require('../models/User');
const { faker } = require('@faker-js/faker')
const argon2 = require("argon2");

const MONGO_URI = process.env.MONGO_URI;
const password = process.env.TEST_PWD;

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

            const hashedPassword = await argon2.hash(password)
            const startdate = new Date(2023, 9, 12);
            const enddate = new Date(2025, 9, 12);
            const pdfUrl = "http://localhost:3000/workers/dummy.pdf"

            await House.insertMany(houses)
            const house = await House.findOne({}).exec();
            await User.insertMany([
                // {
                //     username: 'EmployeeTest',
                //     email: "test1@gmail.com",
                //     password: hashedPassword,
                //     role: "employee",
                //     birthday: new Date(),
                //     house: house._id,
                //     firstName: 'John',
                //     lastName: 'Doe',
                //     onboardingStatus: 'Not Started',
                //     visaStartDate: startdate,
                //     visaEndDate:enddate,
                //     workAuth:"OPT",
                //     optUrl:pdfUrl,
                //     registrationHistory: {
                //       email: "test1@gmail.com",
                //       status: 'Registered'
                //   },
                //   },
                //   {
                //     username: 'EmployeeTest2',
                //     email: "test2@gmail.com",
                //     password: hashedPassword,
                //     role: "employee",
                //     birthday: new Date(),
                //     house: house._id,
                //     firstName: 'Mike',
                //     lastName: 'Island',
                //     onboardingStatus: 'Not Started',
                //     visaStartDate: startdate,
                //     visaEndDate:enddate,
                //     workAuth:"OPT",
                //     optUrl:pdfUrl,

                //   },
                //   {
                //     username: 'EmployeeTest3',
                //     email: "test3@gmail.com",
                //     password: hashedPassword,
                //     role: "employee",
                //     birthday: new Date(),
                //     house: house._id,
                //     firstName: 'Lisa',
                //     lastName: 'Ashton',
                //     onboardingStatus: 'Not Started',
                //     visaStartDate: startdate,
                //     visaEndDate:enddate,
                //     workAuth:"OPT",
                //     optUrl:pdfUrl,
                //     registrationHistory: {
                //       email: "test3@gmail.com",
                //       status: 'Registered'
                //   },
                //   },
                //   {
                //     username: 'EmployeeTest4',
                //     email: "test4@gmail.com",
                //     password: hashedPassword,
                //     role: "employee",
                //     house: house._id,
                //     birthday: new Date(),
                //     firstName: 'Luke',
                //     lastName: 'Evans',
                //     onboardingStatus: 'Rejected',
                //     registrationHistory: {
                //         email: "test2@gmail.com",
                //         status: 'Registered'
                //     },
                //   },
                  {
                    username: 'HRTest',
                    // firstName: 'Test',
                    // lastName: 'HR',
                    // workAuth:"OPT",
                    email: "testhr@gmail.com",
                    password: hashedPassword,
                    role: "hr",
                    // visaStartDate: startdate,
                    // visaEndDate:enddate,
                    // optUrl:pdfUrl,
                  }
            ])
            // const user = await User.findOne({}).lean().exec()
            // house.employees.push(user._id)
            // await house.save()
        
        }
        if (process.env.NODE_ENV !== 'production') {
            //  seed().then(() => console.log(`Successfully seeded with 5 house and 2 users: EmployeeTest and HRTest with password: ${password}`)).catch(error => console.log('Error seeding:', error.message))
        }

    })
    .catch(error => console.log('Error connecting to MongoDB:', error))

const db = mongoose.connection;

module.exports = db;
