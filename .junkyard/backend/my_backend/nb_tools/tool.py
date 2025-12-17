 
def getSqlalchemyAdr(
    server = "localhost",
    port = 5432,
    user = "postgres",
    password = "nada",
    database = "postgres"
    ):
    return "postgresql://{user}:{password}@{server}:{port}/{database}".format(
        user = user, password = password, server = server, port = str(port),
        database = database
    )
