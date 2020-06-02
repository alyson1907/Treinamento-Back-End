## Descrição
Este repositório implementa protótipos de microsserviços (um para Produtos e outro para Usuários) e a comunicação entre eles.

## Tecnologias Gerais
### Banco de Dados
- **MySQL**: Banco de dados contendo as tabelas
- **Knex**: Querybuilder que realiza a conexão com o banco de dados MySQL
- **ObjectionJS**: ORM utilizado sobre o `Knex`
- **Micro e Micro-Router**: bibliotecas oferecidas pela Zeit. Utilizadas para lidar com requisições HTTP e expor endpoints
- **Jest**: utilizado para implementar testes automatizados

## Tecnologias Específicas de cada Microsserviço
## Microsserviço de Produtos
- **aws-sdk**: utilizado para acessar o serviço AWS-S3 para fazer upload de imagens
## Microsserviço de Usuários
- **Bcrypt**: biblioteca utilizada para gerar hashes para as senhas dos usuários
- **jsonwebtoken**: gerador de tokens de autenticação de usuários

