CREATE DATABASE  IF NOT EXISTS `moneyshield` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `moneyshield`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: moneyshield
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Temporary view structure for view `budget_vs_actual`
--

DROP TABLE IF EXISTS `budget_vs_actual`;
/*!50001 DROP VIEW IF EXISTS `budget_vs_actual`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `budget_vs_actual` AS SELECT 
 1 AS `first_name`,
 1 AS `last_name`,
 1 AS `category`,
 1 AS `year`,
 1 AS `month`,
 1 AS `budget_amount`,
 1 AS `actual_amount`,
 1 AS `difference`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `category_id` int NOT NULL,
  `year` int NOT NULL,
  `month` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `budgets_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `profiles`
--

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `saving_types`
--

DROP TABLE IF EXISTS `saving_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saving_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `savings`
--

DROP TABLE IF EXISTS `savings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `type_id` (`type_id`),
  CONSTRAINT `savings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `savings_ibfk_3` FOREIGN KEY (`type_id`) REFERENCES `saving_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `savings_summary`
--

DROP TABLE IF EXISTS `savings_summary`;
/*!50001 DROP VIEW IF EXISTS `savings_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `savings_summary` AS SELECT 
 1 AS `first_name`,
 1 AS `last_name`,
 1 AS `saving_type`,
 1 AS `saving_name`,
 1 AS `amount`,
 1 AS `notes`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `transaction_types`
--

DROP TABLE IF EXISTS `transaction_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `type_id` int NOT NULL,
  `category_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `type_id` (`type_id`),
  KEY `fk_transaction_category` (`category_id`),
  CONSTRAINT `fk_transaction_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`type_id`) REFERENCES `transaction_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary view structure for view `user_expenses_by_category`
--

DROP TABLE IF EXISTS `user_expenses_by_category`;
/*!50001 DROP VIEW IF EXISTS `user_expenses_by_category`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `user_expenses_by_category` AS SELECT 
 1 AS `user_id`,
 1 AS `full_name`,
 1 AS `category_name`,
 1 AS `category_amount`,
 1 AS `category_budget`,
 1 AS `category_status`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `user_financial_summary`
--

DROP TABLE IF EXISTS `user_financial_summary`;
/*!50001 DROP VIEW IF EXISTS `user_financial_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `user_financial_summary` AS SELECT 
 1 AS `user_id`,
 1 AS `full_name`,
 1 AS `email`,
 1 AS `profile_type`,
 1 AS `base_budget`,
 1 AS `base_saving`,
 1 AS `total_income`,
 1 AS `total_expenses`,
 1 AS `current_balance`,
 1 AS `total_budget`,
 1 AS `total_savings`,
 1 AS `saving_status`,
 1 AS `budget_status`,
 1 AS `current_month`,
 1 AS `current_year`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `user_monthly_budget_usage`
--

DROP TABLE IF EXISTS `user_monthly_budget_usage`;
/*!50001 DROP VIEW IF EXISTS `user_monthly_budget_usage`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `user_monthly_budget_usage` AS SELECT 
 1 AS `user_id`,
 1 AS `user_name`,
 1 AS `profile_type`,
 1 AS `t_month`,
 1 AS `total_expenses`,
 1 AS `total_budget`,
 1 AS `budget_usage_percentage`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `profile_id` int NOT NULL,
  `base_budget` decimal(10,2) NOT NULL DEFAULT '0.00',
  `base_saving` decimal(10,2) NOT NULL DEFAULT '0.00',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `profile_id` (`profile_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping events for database 'moneyshield'
--

--
-- Dumping routines for database 'moneyshield'
--
/*!50003 DROP PROCEDURE IF EXISTS `categorize_transactions` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `categorize_transactions`()
BEGIN
    -- Update transactions without category to use Others category (ID 16)
    UPDATE transactions SET category_id = 16 WHERE category_id IS NULL;
    
    -- You could add more logic here to automatically categorize based on description keywords
    -- For example:
    UPDATE transactions SET category_id = 2 WHERE category_id IS NULL 
        AND (description LIKE '%restaurant%' OR description LIKE '%food%' OR description LIKE '%meal%');
    
    UPDATE transactions SET category_id = 3 WHERE category_id IS NULL 
        AND (description LIKE '%rent%' OR description LIKE '%house%' OR description LIKE '%apartment%');
    
    UPDATE transactions SET category_id = 4 WHERE category_id IS NULL 
        AND (description LIKE '%doctor%' OR description LIKE '%medicine%' OR description LIKE '%dental%' OR description LIKE '%health%');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `budget_vs_actual`
--

/*!50001 DROP VIEW IF EXISTS `budget_vs_actual`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `budget_vs_actual` AS select `u`.`first_name` AS `first_name`,`u`.`last_name` AS `last_name`,`c`.`name` AS `category`,`b`.`year` AS `year`,`b`.`month` AS `month`,`b`.`total_amount` AS `budget_amount`,coalesce(sum(`t`.`amount`),0) AS `actual_amount`,(`b`.`total_amount` - coalesce(sum(`t`.`amount`),0)) AS `difference` from (((`budgets` `b` join `users` `u` on((`b`.`user_id` = `u`.`id`))) join `categories` `c` on((`b`.`category_id` = `c`.`id`))) left join `transactions` `t` on(((`t`.`user_id` = `u`.`id`) and (`t`.`category_id` = `c`.`id`) and (`t`.`type_id` = 2)))) group by `u`.`first_name`,`u`.`last_name`,`c`.`name`,`b`.`year`,`b`.`month`,`b`.`total_amount` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `savings_summary`
--

/*!50001 DROP VIEW IF EXISTS `savings_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `savings_summary` AS select `u`.`first_name` AS `first_name`,`u`.`last_name` AS `last_name`,`st`.`name` AS `saving_type`,`s`.`name` AS `saving_name`,`s`.`amount` AS `amount`,`s`.`notes` AS `notes` from ((`savings` `s` join `users` `u` on((`s`.`user_id` = `u`.`id`))) join `saving_types` `st` on((`s`.`type_id` = `st`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_expenses_by_category`
--

/*!50001 DROP VIEW IF EXISTS `user_expenses_by_category`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_expenses_by_category` AS select `u`.`id` AS `user_id`,concat(`u`.`first_name`,' ',`u`.`last_name`) AS `full_name`,`c`.`name` AS `category_name`,sum(`t`.`amount`) AS `category_amount`,coalesce((select `b`.`total_amount` from `budgets` `b` where ((`b`.`user_id` = `u`.`id`) and (`b`.`category_id` = `c`.`id`) and (`b`.`month` = month(curdate())) and (`b`.`year` = year(curdate())))),0) AS `category_budget`,(case when ((sum(`t`.`amount`) <= coalesce((select `b`.`total_amount` from `budgets` `b` where ((`b`.`user_id` = `u`.`id`) and (`b`.`category_id` = `c`.`id`) and (`b`.`month` = month(curdate())) and (`b`.`year` = year(curdate())))),0)) or ((select `b`.`total_amount` from `budgets` `b` where ((`b`.`user_id` = `u`.`id`) and (`b`.`category_id` = `c`.`id`) and (`b`.`month` = month(curdate())) and (`b`.`year` = year(curdate())))) is null)) then 'En presupuesto' else 'Excedido' end) AS `category_status` from (((`users` `u` join `transactions` `t` on((`u`.`id` = `t`.`user_id`))) join `categories` `c` on((`t`.`category_id` = `c`.`id`))) join `transaction_types` `tt` on((`t`.`type_id` = `tt`.`id`))) where (`tt`.`name` = 'Gasto') group by `u`.`id`,`u`.`first_name`,`u`.`last_name`,`c`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_financial_summary`
--

/*!50001 DROP VIEW IF EXISTS `user_financial_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_financial_summary` AS select `u`.`id` AS `user_id`,concat(`u`.`first_name`,' ',`u`.`last_name`) AS `full_name`,`u`.`email` AS `email`,`p`.`name` AS `profile_type`,`u`.`base_budget` AS `base_budget`,`u`.`base_saving` AS `base_saving`,coalesce((select sum(`t_in`.`amount`) from (`transactions` `t_in` join `transaction_types` `tt_in` on((`t_in`.`type_id` = `tt_in`.`id`))) where ((`t_in`.`user_id` = `u`.`id`) and (`tt_in`.`name` = 'Ingreso'))),0) AS `total_income`,coalesce((select sum(`t_ex`.`amount`) from (`transactions` `t_ex` join `transaction_types` `tt_ex` on((`t_ex`.`type_id` = `tt_ex`.`id`))) where ((`t_ex`.`user_id` = `u`.`id`) and (`tt_ex`.`name` = 'Gasto'))),0) AS `total_expenses`,(coalesce((select sum(`t_in`.`amount`) from (`transactions` `t_in` join `transaction_types` `tt_in` on((`t_in`.`type_id` = `tt_in`.`id`))) where ((`t_in`.`user_id` = `u`.`id`) and (`tt_in`.`name` = 'Ingreso'))),0) - coalesce((select sum(`t_ex`.`amount`) from (`transactions` `t_ex` join `transaction_types` `tt_ex` on((`t_ex`.`type_id` = `tt_ex`.`id`))) where ((`t_ex`.`user_id` = `u`.`id`) and (`tt_ex`.`name` = 'Gasto'))),0)) AS `current_balance`,coalesce((select sum(`b`.`total_amount`) from `budgets` `b` where ((`b`.`user_id` = `u`.`id`) and (`b`.`month` = month(curdate())) and (`b`.`year` = year(curdate())))),`u`.`base_budget`) AS `total_budget`,coalesce((select sum(`s`.`amount`) from `savings` `s` where (`s`.`user_id` = `u`.`id`)),`u`.`base_saving`) AS `total_savings`,(case when ((coalesce((select sum(`t_in`.`amount`) from (`transactions` `t_in` join `transaction_types` `tt_in` on((`t_in`.`type_id` = `tt_in`.`id`))) where ((`t_in`.`user_id` = `u`.`id`) and (`tt_in`.`name` = 'Ingreso'))),0) - coalesce((select sum(`t_ex`.`amount`) from (`transactions` `t_ex` join `transaction_types` `tt_ex` on((`t_ex`.`type_id` = `tt_ex`.`id`))) where ((`t_ex`.`user_id` = `u`.`id`) and (`tt_ex`.`name` = 'Gasto'))),0)) >= coalesce((select sum(`s`.`amount`) from `savings` `s` where (`s`.`user_id` = `u`.`id`)),`u`.`base_saving`)) then 'Positivo' else 'Negativo' end) AS `saving_status`,(case when (coalesce((select sum(`t_ex`.`amount`) from (`transactions` `t_ex` join `transaction_types` `tt_ex` on((`t_ex`.`type_id` = `tt_ex`.`id`))) where ((`t_ex`.`user_id` = `u`.`id`) and (`tt_ex`.`name` = 'Gasto'))),0) <= coalesce((select sum(`b`.`total_amount`) from `budgets` `b` where ((`b`.`user_id` = `u`.`id`) and (`b`.`month` = month(curdate())) and (`b`.`year` = year(curdate())))),`u`.`base_budget`)) then 'En presupuesto' else 'Excedido' end) AS `budget_status`,month(curdate()) AS `current_month`,year(curdate()) AS `current_year` from (`users` `u` join `profiles` `p` on((`u`.`profile_id` = `p`.`id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `user_monthly_budget_usage`
--

/*!50001 DROP VIEW IF EXISTS `user_monthly_budget_usage`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `user_monthly_budget_usage` AS select `u`.`id` AS `user_id`,concat(`u`.`first_name`,' ',`u`.`last_name`) AS `user_name`,`p`.`name` AS `profile_type`,date_format(`t`.`created_at`,'%Y-%m') AS `t_month`,sum(`t`.`amount`) AS `total_expenses`,coalesce(sum(`b`.`total_amount`),0) AS `total_budget`,round((case when (coalesce(sum(`b`.`total_amount`),0) = 0) then 0 else ((sum(`t`.`amount`) / sum(`b`.`total_amount`)) * 100) end),2) AS `budget_usage_percentage` from (((`transactions` `t` join `users` `u` on((`t`.`user_id` = `u`.`id`))) join `profiles` `p` on((`u`.`profile_id` = `p`.`id`))) left join `budgets` `b` on(((`b`.`user_id` = `u`.`id`) and (`b`.`month` = month(`t`.`created_at`)) and (`b`.`year` = year(`t`.`created_at`))))) where (`t`.`type_id` = 2) group by `u`.`id`,`t_month` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-03  8:31:58
