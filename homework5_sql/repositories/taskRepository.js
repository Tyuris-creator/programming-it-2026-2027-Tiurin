import pool from "../db/pool.js";


export default class TaskRepository {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT id, title, completed, student_id AS "studentId"
      FROM tasks
    `);

    return rows;
  }

  async add(task) {
    const { rows } = await pool.query(
      `INSERT INTO tasks (id, title, completed, student_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, completed, student_id AS "studentId"`,
      [task.id, task.title, task.completed ?? false, task.studentId],
    );

    return rows[0];
  }

  async remove(id) {
    const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    return result.rowCount > 0;
  }
}
