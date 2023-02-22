module.exports = (sequelize, DataTypes) => {
  const OrderDetail = sequelize.define(
    "OrderDetail",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // references: {
        //     model: 'Subscription',
        //     key: 'id'
        // },
      },
      app_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }
    },
    {
      tableName: "order_details",
      timestamps: false,
    }
  );

  OrderDetail.associate = (models) => {
    OrderDetail.hasOne(models.Order, {
      foreignKey: "order_id",
      sourceKey: "id",
    });
    // OrderDetail.hasMany(models.Apps, { foreignKey: 'app_id', sourceKey: 'app_id' });
  };

  return OrderDetail;
};
