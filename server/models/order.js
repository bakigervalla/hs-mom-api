module.exports = (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        order_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        subscription_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Subscription',
                key: 'id'
            },
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'create',
        },
        created_by: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        create_date: {
            type: 'TIMESTAMP',
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
            allowNull: false,
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
        default_app_id: {
            type: DataTypes.INTEGER
        },
    },
        {
            tableName: "orders",
            createdAt: 'create_date',
            updatedAt: 'update_date'
        }
    );

    Order.associate = (models) => {
        Order.hasOne(models.Subscription, { foreignKey: 'id', sourceKey: 'subscription_id' });
        Order.hasMany(models.OrderDetail, { foreignKey: 'order_id', sourceKey: 'order_id' });
    }

    return Order;
};