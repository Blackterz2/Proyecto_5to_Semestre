USE fitness_app;

ALTER TABLE usuarios ADD COLUMN sexo ENUM('Masculino', 'Femenino', 'Otro') DEFAULT 'Otro';
