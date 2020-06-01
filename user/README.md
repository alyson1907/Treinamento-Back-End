## Campos das entidades
- **User:** rg (PK), name, age
- **Account:** email (PK), password, userRg(FK), accessLevel



## Funções
#### User
- **createUser:** cria usuário no DB 
- **getUser:** consulta dados do usuário a partir do rg
- **updateUser:** atualiza dados do usuário a partir do rg
- **deleteUser:** remove um usuário a partir de seu rg (e consequentemente todas as suas contas associadas)

#### Account
- **createAccount:** cria conta para determinado usuário
- **getUserAccounts:** utilizada para o usuário consultar todas as suas contas cadastradas a partir de seu rg
- **updateAccount:** atualiza dados de uma conta a partir do email antigo/atual
- **deleteAccount:** remove uma conta a partir do email antigo/atual

#### Authentication/Authorization
- **login** recebe email/senha, valida o login e envia como resposta o token (caso a autenticação esteja correta)
- **userFromToken** recebe um token e retorna um objeto contendo `{email, rg e accessLevel}` do usuario associado


## Paths/Queries das Requisições
#### Auth
- **POST** '/login'     -> enviar json contendo 'email' e 'password'. O serviço responderá com o token

#### User
rg sendo a PK para identificação do usuario
- **POST** '/user'
- **GET** '/user'       -> utilizar a querystring ?rg=<numero_do_rg>
- **PATCH** '/user'     -> utilizar a querystring ?rg=<numero_do_rg>
- **DEL** '/user'       -> utilizar a querystring ?rg=<numero_do_rg>

#### Account
- email sendo a PK para identificar uma conta
- enviar no path o token que é retornado ao fazer o login


- **POST** '/account'
- **GET** '/account/:token'    -> utilizar a querystring ?rg=<numero_do_rg>
- **PATCH** '/account/:token'  -> utilizar a querystring ?currEmail=<end_de_email> *currEmail* é o email antigo/atual
- **DEL** '/account/:token'    -> utilizar a querystring ?email=<end_de_email> *email* que será deletado