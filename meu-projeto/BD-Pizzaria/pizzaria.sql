--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-06-15 20:59:16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 16438)
-- Name: carrossel_topo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.carrossel_topo (
    id integer NOT NULL,
    imagem text NOT NULL,
    legenda text
);


ALTER TABLE public.carrossel_topo OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16437)
-- Name: carrossel_topo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.carrossel_topo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carrossel_topo_id_seq OWNER TO postgres;

--
-- TOC entry 4847 (class 0 OID 0)
-- Dependencies: 220
-- Name: carrossel_topo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.carrossel_topo_id_seq OWNED BY public.carrossel_topo.id;


--
-- TOC entry 227 (class 1259 OID 24870)
-- Name: combos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.combos (
    id integer NOT NULL,
    nome text NOT NULL,
    itens text NOT NULL,
    preco numeric(6,2) NOT NULL
);


ALTER TABLE public.combos OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24869)
-- Name: combos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.combos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.combos_id_seq OWNER TO postgres;

--
-- TOC entry 4848 (class 0 OID 0)
-- Dependencies: 226
-- Name: combos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.combos_id_seq OWNED BY public.combos.id;


--
-- TOC entry 219 (class 1259 OID 16409)
-- Name: gerentes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gerentes (
    usuario_id integer NOT NULL
);


ALTER TABLE public.gerentes OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 24860)
-- Name: pedidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedidos (
    id integer NOT NULL,
    nome_cliente text NOT NULL,
    nome_pizza text NOT NULL,
    tamanho text NOT NULL,
    preco numeric(6,2) NOT NULL,
    data_pedido timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pedidos OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24859)
-- Name: pedidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pedidos_id_seq OWNER TO postgres;

--
-- TOC entry 4849 (class 0 OID 0)
-- Dependencies: 224
-- Name: pedidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_id_seq OWNED BY public.pedidos.id;


--
-- TOC entry 223 (class 1259 OID 24711)
-- Name: pizzas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pizzas (
    id integer NOT NULL,
    nome text NOT NULL,
    ingredientes text,
    preco numeric(6,2) NOT NULL
);


ALTER TABLE public.pizzas OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24710)
-- Name: pizzas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pizzas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pizzas_id_seq OWNER TO postgres;

--
-- TOC entry 4850 (class 0 OID 0)
-- Dependencies: 222
-- Name: pizzas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pizzas_id_seq OWNED BY public.pizzas.id;


--
-- TOC entry 218 (class 1259 OID 16389)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome text,
    email text NOT NULL,
    senha text NOT NULL
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16388)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- TOC entry 4851 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 4666 (class 2604 OID 16441)
-- Name: carrossel_topo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrossel_topo ALTER COLUMN id SET DEFAULT nextval('public.carrossel_topo_id_seq'::regclass);


--
-- TOC entry 4670 (class 2604 OID 24873)
-- Name: combos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combos ALTER COLUMN id SET DEFAULT nextval('public.combos_id_seq'::regclass);


--
-- TOC entry 4668 (class 2604 OID 24863)
-- Name: pedidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos ALTER COLUMN id SET DEFAULT nextval('public.pedidos_id_seq'::regclass);


--
-- TOC entry 4667 (class 2604 OID 24714)
-- Name: pizzas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pizzas ALTER COLUMN id SET DEFAULT nextval('public.pizzas_id_seq'::regclass);


--
-- TOC entry 4665 (class 2604 OID 16392)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 4835 (class 0 OID 16438)
-- Dependencies: 221
-- Data for Name: carrossel_topo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.carrossel_topo (id, imagem, legenda) FROM stdin;
10	/uploads/1749645829704.jpg	
11	/uploads/1749645845670.jpg	
12	/uploads/1749645864213.jpg	
\.


--
-- TOC entry 4841 (class 0 OID 24870)
-- Dependencies: 227
-- Data for Name: combos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.combos (id, nome, itens, preco) FROM stdin;
2	Combo Pepperoni	Duas pizzas de pepperoni médias e uma Pepsi 2 litros	45.00
\.


--
-- TOC entry 4833 (class 0 OID 16409)
-- Dependencies: 219
-- Data for Name: gerentes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gerentes (usuario_id) FROM stdin;
1
11
\.


--
-- TOC entry 4839 (class 0 OID 24860)
-- Dependencies: 225
-- Data for Name: pedidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedidos (id, nome_cliente, nome_pizza, tamanho, preco, data_pedido) FROM stdin;
1	luizamarodolfo@gmail.com	Mocca	Pequena	0.01	2025-06-11 08:17:20.985576
2	luizamarodolfo@gmail.com	Mocca	Média	5.01	2025-06-11 08:35:00.680787
3	kimalien307@gmail.com	Mocca	Média	5.01	2025-06-11 09:03:05.538101
4	kimalien307@gmail.com	calabreso	Pequena	10.00	2025-06-11 09:03:05.555163
5	kimalien307@gmail.com	calabreso	Pequena	10.00	2025-06-11 09:28:33.019583
6	luizamarodolfo@gmail.com	calabreso	Pequena	10.00	2025-06-11 13:26:30.886637
7	luizamarodolfo@gmail.com	calabreso	Pequena	10.00	2025-06-11 13:31:08.117178
\.


--
-- TOC entry 4837 (class 0 OID 24711)
-- Dependencies: 223
-- Data for Name: pizzas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pizzas (id, nome, ingredientes, preco) FROM stdin;
11	pepperoni	teste	10.00
14	calabreso	calma	10.00
16	4 queijos	4 tipos de queijos	20.00
\.


--
-- TOC entry 4832 (class 0 OID 16389)
-- Dependencies: 218
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nome, email, senha) FROM stdin;
1	MR	luizamarodolfo@gmail.com	mr210909
11	Mocca	mocca@gmail.com	mocca
12	alduin	alduin@gmail.com	alduin123
13	cliente	cliente@gmail.com	cliente
14	Anna Linda	Anna@gmail.com	Anna123
15	RafaelaZ	kimalien307@gmail.com	rafalegal
16	Papa Capim	papacapim@gmail.com	lindona123
17	123	email@gmail.com	123
18	,	a@gmail.com	ççç
20	Daniela	danizin@gmail.com	dani
\.


--
-- TOC entry 4852 (class 0 OID 0)
-- Dependencies: 220
-- Name: carrossel_topo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.carrossel_topo_id_seq', 12, true);


--
-- TOC entry 4853 (class 0 OID 0)
-- Dependencies: 226
-- Name: combos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.combos_id_seq', 2, true);


--
-- TOC entry 4854 (class 0 OID 0)
-- Dependencies: 224
-- Name: pedidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_id_seq', 7, true);


--
-- TOC entry 4855 (class 0 OID 0)
-- Dependencies: 222
-- Name: pizzas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pizzas_id_seq', 20, true);


--
-- TOC entry 4856 (class 0 OID 0)
-- Dependencies: 217
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 20, true);


--
-- TOC entry 4678 (class 2606 OID 16445)
-- Name: carrossel_topo carrossel_topo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.carrossel_topo
    ADD CONSTRAINT carrossel_topo_pkey PRIMARY KEY (id);


--
-- TOC entry 4684 (class 2606 OID 24877)
-- Name: combos combos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.combos
    ADD CONSTRAINT combos_pkey PRIMARY KEY (id);


--
-- TOC entry 4676 (class 2606 OID 16413)
-- Name: gerentes gerentes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gerentes
    ADD CONSTRAINT gerentes_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 4682 (class 2606 OID 24868)
-- Name: pedidos pedidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedidos
    ADD CONSTRAINT pedidos_pkey PRIMARY KEY (id);


--
-- TOC entry 4680 (class 2606 OID 24718)
-- Name: pizzas pizzas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pizzas
    ADD CONSTRAINT pizzas_pkey PRIMARY KEY (id);


--
-- TOC entry 4672 (class 2606 OID 16398)
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- TOC entry 4674 (class 2606 OID 16396)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 4685 (class 2606 OID 16414)
-- Name: gerentes gerentes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.gerentes
    ADD CONSTRAINT gerentes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id);


-- Completed on 2025-06-15 20:59:17

--
-- PostgreSQL database dump complete
--

