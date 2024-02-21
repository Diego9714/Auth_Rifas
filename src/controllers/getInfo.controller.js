const Users = require('../models/users.js')

const controller = {}

controller.logUser = async (req, res) => {
  try {
    const data = { email, password } = req.body
    const user  = await Users.verifyUser(data)
    console.log(user)
    res.status(user.code).json(user)
  } catch (err) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

controller.stats = async (req, res) => {
  try {
    const data = { id_supervisor , type_supervisor } = req.params
    const user  = await Users.statsUser(data)
    res.status(user.code).json(user)
  } catch (err) {
    res.status(500).json({ error: "Error al realizar la consulta" })
  }
}

module.exports = controller
