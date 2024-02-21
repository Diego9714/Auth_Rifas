const pool = require('../utils/mysql.connect.js') 

const { KEY } = require('../global/_var.js')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// ----- Verify User -----
const verifyUser = async ({data}) => {
  try {
    let msg = {
      status: false,
      message: "User not found",
      code: 500
    }

    const connection = await pool.getConnection()
    
    const sqlBoss = 'SELECT id_boss, fullname , address , email, password, permit_level , activation_status ,date_created FROM chiefs WHERE email = ? ;'
    const [boss] = await connection.execute(sqlBoss,[email])
    
    const sqlSeller = 'SELECT id_seller, fullname , address , email, password, activation_status, permit_level FROM sellers WHERE email = ? ;'
    const [seller] = await connection.execute(sqlSeller,[email])
    
    if(boss.length > 0) {
      const sql = 'SELECT license FROM licenses WHERE id_boss = ? ;'
      const [verify] = await connection.execute(sql,[boss[0].id_boss])

      let license = verify[0].license

      let fecha = jwt.verify(license, KEY , (err, decoded) => {
        if(err) throw err
        return decoded
      })

      const fechaActual = new Date();
      const date_created = fechaActual.toISOString().split('T')[0];

      if(date_created >= fecha.date_expires){
        msg = {
          status: false,
          message: "Access denied",
          code: 500
        }
      }else if(date_created <= fecha.date_expires){
        
        let tokenInfo = {
          id_boss: boss[0].id_boss,
          fullname: boss[0].fullname,
          address: boss[0].address,
          email: boss[0].email,
          level: boss[0].permit_level,
          activationStatus: boss[0].activation_status,
          timeLicense: fecha.timeLicense,
          date_created: fecha.date_create,
          date_expires: fecha.date_expires
        }

        console.log(tokenInfo)

        const match = await bcrypt.compare(password, boss[0].password) 
        
        const token = jwt.sign(tokenInfo, KEY, { algorithm: "HS256" })

        if (match) {
          msg = {
            status: true,
            message: "Logged successfully Boss",
            code: 200,
            infoUser: token
          }
        } else {
          msg = {
            status: false,
            message: "Incorrect password",
            code: 500
          }
        }
      
      }

    }else if(seller.length > 0) {
      let tokenInfo = {
        id_seller: seller[0].id_seller,
        name: seller[0].name,
        lastname: seller[0].lastname,
        email: seller[0].email,
        activationStatus: seller[0].activation_status,
        level: seller[0].permit_level
      }

      console.log(tokenInfo)

      if (seller[0].activation_status == 1){
        if (email === seller[0].email) {
          const match = await bcrypt.compare(password, seller[0].password) 
          
          const token = jwt.sign(tokenInfo, KEY, { algorithm: "HS256" })
  
          if (match) {
            msg = {
              status: true,
              message: "Logged successfully seller",
              code: 200,
              level: 1,
              infoUser: token
            }
          } else {
            msg = {
              status: false,
              message: "Incorrect password",
              code: 500
            }
          }
        } else {
          msg = {
            status: false,
            message: "User not found, verify your email and password",
            code: 404
          }
        }
      }else{
        msg = {
          status: false,
          message: "This user is not active",
          code: 500
        }
      }
    }

    connection.release()

    return msg

  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err
    }
    return msg
  }
}

// ----- User statistics -----
const statsUser = async ({data}) => {
  try {
    let msg = {
      status: false,
      message: "Statics not found",
      code: 500
    }
    
    const connection = await pool.getConnection()

    if(type_supervisor == "ADM"){
      // Cantidad de Clientes
      let sqlClient = `SELECT COUNT(id_client) AS client_count FROM clients WHERE id_supervisor = ? AND type_supervisor = ? AND activation_status = ? ;`
      let [clients] = await connection.execute(sqlClient,[id_supervisor , type_supervisor, 1])
  
      // console.log(clients)

      // Cantidad de Rifas
      let sqlRaffles = `SELECT COUNT(id_raffle) AS raffle_count FROM raffles WHERE id_boss = ? AND activation_status = ?;`
      let [raffles] = await connection.execute(sqlRaffles,[id_supervisor , 1])

      // console.log(raffles)

      // Cantidad de Tickets Pagados
      let sqlTicketsSold = `SELECT COUNT(id_ticket) AS ticketSold_count FROM tickets WHERE id_supervisor = ? AND type_supervisor = ? AND status_ticket = ? ;`
      let [tickets_sold] = await connection.execute(sqlTicketsSold,[id_supervisor,type_supervisor,1])

      console.log(tickets_sold)

      // Cantidad de Tickets Abonados
      let sqlTicketsPaid = `SELECT COUNT(id_ticket) AS ticketPaid_count FROM tickets WHERE id_supervisor = ? AND type_supervisor = ? AND status_ticket = ? ;`
      let [tickets_paid] = await connection.execute(sqlTicketsPaid,[id_supervisor,type_supervisor,2])

      console.log(tickets_paid)

      let infoStats = {
        clients: clients[0].client_count,
        raffles: raffles[0].raffle_count,
        tickets_sold: tickets_sold[0].ticketSold_count,
        tickets_paid: tickets_paid[0].ticketPaid_count,
      }

      if (clients.length >= 0 || raffles.length >= 0 || tickets_sold.length >= 0 || tickets_paid.length >= 0) {
        msg = {
          status: true,
          message: "Stats found",
          code: 200,
          data: infoStats,
        }
      }
    }
    if(type_supervisor == "VED"){
      // Cantidad de Clientes
      let sqlClient = `SELECT COUNT(id_client) AS client_count FROM clients WHERE id_supervisor = ? AND type_supervisor = ? AND activation_status = ? ;`
      let [clients] = await connection.execute(sqlClient,[id_supervisor , type_supervisor, 1])
  
      // console.log(clients)

      // Obtener Id_boss 
      let sqlBoss = `SELECT id_boss FROM sellers WHERE id_seller = ? ;`
      const [boss] = await connection.execute(sqlBoss, [id_supervisor])

      let id_boss = boss[0].id_boss

      // Cantidad de Rifas      
      let sqlRaffles = `SELECT COUNT(id_raffle) AS raffle_count FROM raffles WHERE id_boss = ? AND activation_status = ?;`
      let [raffles] = await connection.execute(sqlRaffles,[id_boss, 1])

      console.log(raffles)

      // Cantidad de Tickets Pagados
      let sqlTicketsSold = `SELECT COUNT(id_ticket) AS ticketSold_count FROM tickets WHERE id_supervisor = ? AND type_supervisor = ? AND status_ticket = ? ;`
      let [tickets_sold] = await connection.execute(sqlTicketsSold,[id_supervisor,type_supervisor,1])

      // console.log(tickets_sold)

      // Cantidad de Tickets Abonados
      let sqlTicketsPaid = `SELECT COUNT(id_ticket) AS ticketPaid_count FROM tickets WHERE id_supervisor = ? AND type_supervisor = ? AND status_ticket = ? ;`
      let [tickets_paid] = await connection.execute(sqlTicketsPaid,[id_supervisor,type_supervisor,2])

      // console.log(tickets_paid)

      let infoStats = {
        clients: clients[0].client_count,
        raffles: raffles[0].raffle_count,
        tickets_sold: tickets_sold[0].ticketSold_count,
        tickets_paid: tickets_paid[0].ticketPaid_count,
      }

      if (clients.length >= 0 || raffles.length >= 0 || tickets_sold.length >= 0 || tickets_paid.length >= 0) {
        msg = {
          status: true,
          message: "Stats found",
          code: 200,
          data: infoStats,
        }
      }
    }

    connection.release()

    return msg
  } catch (err) {
    let msg = {
      status: false,
      message: "Something went wrong...",
      code: 500,
      error: err
    }
    return msg
  }
}

module.exports = {
  verifyUser,
  statsUser
}
