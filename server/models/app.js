module.exports = (sequelize, DataTypes) => {
    const App = sequelize.define('App', {
        app_id: {
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
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
        image: {
            type: DataTypes.BLOB('long'),
            allowNull: false,
        },
    },
        {
            tableName: "apps",
            createdAt: 'create_date',
            updatedAt: 'update_date'
        }
        
    );

    App.associate = (models) => {
        App.hasOne(models.Subscription, { foreignKey: 'id', sourceKey: 'subscription_id' });
    }

    return App;
};