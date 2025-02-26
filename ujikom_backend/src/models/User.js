import pool from '../config/database.js';

const User = {
  createUser: async (username, email, password) => {
    const [rows] = await pool.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
    return rows;
  },

  findOne: async (criteria) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [criteria.email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  find: async () => {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  },

  updateUser: async (id, username, email) => {
    const [result] = await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, id]);
    return result.affectedRows > 0;
  },

  deleteUser: async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default User;
