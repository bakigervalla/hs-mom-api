module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        user_id: {
            // type: DataTypes.UUID,
            // defaultValue: DataTypes.UUIDV1,
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            allowNull: false,

        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        phone: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        email_confirmed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_locked: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        lock_date: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        create_date: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
        },
        update_date: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
        },
        email_confirm_token: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
        {
            tableName: "users",
            createdAt: 'create_date',
            updatedAt: 'update_date'
        },
        {
            classMethods: {
                associate(models) {
                    User.hasMany(models.Clients);
                },
            },
        });

    return User;
};