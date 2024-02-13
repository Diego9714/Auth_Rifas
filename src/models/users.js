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
    
    const sqlBoss = 'SELECT id_boss, fullname , address , email, password , date_created FROM chiefs WHERE email = ? ;'
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
          timeLicense: fecha.timeLicense,
          date_created: fecha.date_create,
          date_expires: fecha.date_expires
        }

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

// // ----- User statistics -----
// const statsUser = async ({data}) => {
//   try {
//     let msg = {
//       status: false,
//       message: "Statics not found",
//       code: 500
//     }
    
//     let sql = `SELECT id_boss FROM chiefs WHERE id_boss = '${id}';`
//     let boss = await pool.query(sql)

//     let sql0 = `SELECT id_seller FROM sellers WHERE id_seller = '${id}';`
//     let seller = await pool.query(sql0)

//     if (boss.rows.length > 0) {

      

//     }else if(seller.rows.length > 0){
//       let tokenInfo = {
//         id_boss: seller.rows[0].id_seller,
//         name: seller.rows[0].name,
//         lastname: seller.rows[0].lastname,
//         email: seller.rows[0].email
//       }

//       if (email === seller.rows[0].email) {
//         const match = await bcrypt.compare(password, seller.rows[0].password) 
        
//         const token = jwt.sign(tokenInfo, KEY, { algorithm: "HS256" })

//         if (match) {
//           msg = {
//             status: true,
//             message: "Logged successfully seller",
//             code: 200,
//             infoUser: token
//           }
//         } else {
//           msg = {
//             status: false,
//             message: "Incorrect password",
//             code: 500
//           }
//         }
//       } else {
//         msg = {
//           status: false,
//           message: "User not found, verify your email and password",
//           code: 404
//         }
//       }
//     }

//     return msg

//   } catch (err) {
//     let msg = {
//       status: false,
//       message: "Something went wrong...",
//       code: 500,
//       error: err
//     }
//     return msg
//   }
// }

module.exports = {
  verifyUser,
  // statsUser
}
