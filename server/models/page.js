module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define(
    "Page",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      app_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      account_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_id: {
        type: DataTypes.NUMBER,
        allowNull: false,
        unique: true,
      },
      page_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      page_picture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      default: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      tableName: "pages",
      timestamps: false,
    }
  );

  return Page;
};
