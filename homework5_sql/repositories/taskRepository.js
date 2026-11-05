import pool from "../db/pool.js";

export default class TaskRepository {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT id, title, completed, student_id AS "studentId"
      FROM tasks
    `);

    return rows;
  }
}
