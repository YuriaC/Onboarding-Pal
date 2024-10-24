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

            const hashedPassword = await argon2.hash(password)
            const startdate = new Date(2023, 9, 12);
            const enddate = new Date(2025, 9, 12);
            ///const pdfUrl = "https://beaconfire-hr-project.s3.us-east-1.amazonaws.com/ead1.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=ASIAV6NQT256JOWC5ODF%2F20241023%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20241023T162307Z&X-Amz-Expires=300&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEFkaCXVzLWVhc3QtMSJHMEUCIGpVrgyHVOozyTCB2JmfI6NjKLfQlHuNVrb%2BzoS2au39AiEAnekwoIzos1Ioq8pi1AxVQQxCMoPnT2%2FQ9Tlg418ZlyUq9QIIwv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARADGgw0MDg5MjkxNjMxMzIiDBjC8DzCSJEJTKcEdSrJAvC5rA9ievtRK6cF8qtq4WnUOI3KOmAJNzJXkd8NmwdEj5rFoANTaGF8xBhcI0dZgN1p5jX9GMte8ArtSekavXPLjg67ZD6zc62MjEJPyNK4uuV1JyM7lz%2FJFgrR%2BZlHZRB3xwBx1670amWaYjxLvGKzzAxzWzRrg8ptvVAmf%2FeEQITXnwgFooZlbBZ1bkE4lYt06evKALmxFHDeSlOxiewuEyOsnA%2BBye9prSD3afjF6HPYQdT4KoY1O3pnW8FGwOZ4oibfIxFUXf84dE43MitEAeXBp8kwVLcnAMVNPargqyX0yA0rnzHfuLoROOvRvRd3Qw2OaEFZLhjS1gYfnfd4L6z2vqRt1U4t0yGtM2Cbf99R5JAGVcBnKpkWMaHthZW5ATvHhdLLh%2FT9ia4GWLZJn5BS2%2FEbk9qMFGvdLyYGCv8id8%2FbNoigMMvF5LgGOrMCardzoB7wPuvRiKD0jdyobZ1q4GEOTjvXcvquttx6e%2FKUSVlkpSPaQ%2F6%2BEvBVlyTce3R6nxqjj6Pl0JdGT%2Frq34kn243WBQRYOR5qxSW0di399HiAZt6711HO1aRWnqVZmWjzw%2BYPLbmszxmbus%2FTXIAGk3gR5nVzBZzHlmQQLvBK681p3QNzRlDdQeT4hiw1q0d6bIEGaEZyl9sjRI4qV%2FRPYjbPpbl1HtO8f7ZylrjKY87k%2F8dv6pUoHqUZgkGKPt1xCsVSOl1d5xRy3pCHLsFw0fiMss%2BQbRZKTutkP6PqZ%2FPsrsHBGLsgaiRCnWKuH3GcuzpybD75PRv7YQV2QrmRZBOwV%2BMXUV7pEPPc9AZ642Y4G1liNguQWfTuvSDnEmHBBWCVFbgYc9KglqJHIIhbUg%3D%3D&X-Amz-Signature=4aa205348bac369480c46d09082814682724f5cb50a2352bd6e61bf3bae60caf&X-Amz-SignedHeaders=host&response-content-disposition=inline";
            const pdfUrl = "http://localhost:3000/workers/dummy.pdf"

            await House.insertMany(houses)
            const house = await House.findOne({}).exec();
            await User.insertMany([
                {
                    username: 'EmployeeTest',
                    email: "test1@gmail.com",
                    password: hashedPassword,
                    role: "employee",
                    birthday: new Date(),
                    house: house._id,
                    firstName: 'John',
                    lastName: 'Doe',
                    onboardingStatus: 'Not Started',
                    visaStartDate: startdate,
                    visaEndDate:enddate,
                    workAuth:"OPT",
                    optUrl:pdfUrl,
                    registrationHistory: {
                      email: "test1@gmail.com",
                      status: 'Registered'
                  },
                  },
                  {
                    username: 'EmployeeTest2',
                    email: "test2@gmail.com",
                    password: hashedPassword,
                    role: "employee",
                    birthday: new Date(),
                    house: house._id,
                    firstName: 'Mike',
                    lastName: 'Island',
                    onboardingStatus: 'Not Started',
                    visaStartDate: startdate,
                    visaEndDate:enddate,
                    workAuth:"OPT",
                    optUrl:pdfUrl,
              
                  },
                  {
                    username: 'EmployeeTest3',
                    email: "test3@gmail.com",
                    password: hashedPassword,
                    role: "employee",
                    birthday: new Date(),
                    house: house._id,
                    firstName: 'Lisa',
                    lastName: 'Ashton',
                    onboardingStatus: 'Not Started',
                    visaStartDate: startdate,
                    visaEndDate:enddate,
                    workAuth:"OPT",
                    optUrl:pdfUrl,
                    registrationHistory: {
                      email: "test3@gmail.com",
                      status: 'Registered'
                  },
                  },
                  {
                    username: 'EmployeeTest4',
                    email: "test4@gmail.com",
                    password: hashedPassword,
                    role: "employee",
                    house: house._id,
                    birthday: new Date(),
                    firstName: 'Luke',
                    lastName: 'Evans',
                    onboardingStatus: 'Rejected',
                    registrationHistory: {
                        email: "test2@gmail.com",
                        status: 'Registered'
                    },
                  },
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
            const user = await User.findOne({}).lean().exec()
            house.employees.push(user._id)
            await house.save()
        
        }
        if (process.env.NODE_ENV !== 'production') {
            //  seed().then(() => console.log(`Successfully seeded with 5 house and 2 users: EmployeeTest and HRTest with password: ${password}`)).catch(error => console.log('Error seeding:', error.message))
        }

    })
    .catch(error => console.log('Error connecting to MongoDB:', error))

const db = mongoose.connection;

module.exports = db;
