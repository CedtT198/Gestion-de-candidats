use gestion-candidat

db.createCollection("candidat")
db.candidat.insertOne({
    firstName: "test",
    lastName: "test",
    email: "test@gmail.com",
    phone: "0340000000",
    status: "validated",
    deletedAt: ISODate("2000-01-01"),
    createdAt: ISODate("2000-01-01"),
    updatedAt: ISODate("2000-01-01")
})