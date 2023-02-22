module.exports = (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        client_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        client_uri: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        logo_uri: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        created_by: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        create_date: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        update_by: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        update_date: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
        },
        default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
        {
            tableName: "clients",
            createdAt: 'create_date',
            updatedAt: 'update_date'
        },
        {
            classMethods: {
                associate(models) {
                    // Client.hasMany(models.Orders);
                    Client.hasOne(models.Dashboard);
                },
            },
        });

    return Client;
};