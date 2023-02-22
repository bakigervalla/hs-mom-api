module.exports = (sequelize, DataTypes) => {
    const Subscription = sequelize.define('Subscription', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        period: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_default: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
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
        order: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_popular: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        action_text: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        offers: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        extra_offers: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
        {
            tableName: "subscription_plans",
            createdAt: 'create_date',
            updatedAt: 'update_date'
        }
    );

    Subscription.associate = (models) => {
        Subscription.hasMany(models.App, { foreignKey: 'subscription_id', sourceKey: 'id' });
        Subscription.hasMany(models.Order, { foreignKey: 'subscription_id', sourceKey: 'id' });
    }

    return Subscription;
};