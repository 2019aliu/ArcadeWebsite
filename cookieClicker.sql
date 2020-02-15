/*
@author 2019aliu
SQL database operations for cookie clicker
*/

-- Make all tables, populate data as needed

-- Main table, keep track of user stats
DROP TABLE IF EXISTS cookieClickers;
CREATE TABLE cookieClickers(
    user VARCHAR(100), PRIMARY KEY(user),
    cookiesCount DECIMAL(18,1) DEFAULT 0,
    clickCount INT DEFAULT 0,
    upgradeA INT DEFAULT 0,
    upgradeB INT DEFAULT 0,
    upgradeC INT DEFAULT 0,
    upgradeD INT DEFAULT 0,
    upgradeE INT DEFAULT 0
);
INSERT INTO cookieClickers(user) VALUE('2019aliu');

-- Reference table for upgrading clicks
-- click upgrades will be kept track with letters
DROP TABLE IF EXISTS upgradeClick;
CREATE TABLE upgradeClick(
    upgrade VARCHAR(100), PRIMARY KEY(upgrade),
    upgradeCost DECIMAL(18,1) DEFAULT 0,
    upgradeAmount DECIMAL(18,1) DEFAULT 0
);
INSERT INTO upgradeClick(upgrade, upgradeCost, upgradeAmount) VALUE('upgradeA', 1, 0.1);  -- clicker
INSERT INTO upgradeClick(upgrade, upgradeCost, upgradeAmount) VALUE('upgradeB', 10, 1);  -- cookie assistant
INSERT INTO upgradeClick(upgrade, upgradeCost, upgradeAmount) VALUE('upgradeC', 800, 50);  -- bakery
INSERT INTO upgradeClick(upgrade, upgradeCost, upgradeAmount) VALUE('upgradeD', 50000, 420);  -- factory
INSERT INTO upgradeClick(upgrade, upgradeCost, upgradeAmount) VALUE('upgradeE', 101210, 10000);  -- time machine

-- -- Keep track of the number of each type of upgrade each user has
-- -- Structure: user (NN), upgradeType (NN), upgradeAmount (DEFAULT 0)
-- DROP TABLE IF EXISTS upgrades;
-- CREATE TABLE upgrades(
--     user VARCHAR(100) NOT NULL,
--     upgradeType VARCHAR(100) NOT NULL,
--     upgradeAmount INT DEFAULT 0
-- );

-- Reseting user progress
DROP PROCEDURE IF EXISTS reinitialize_user;
DELIMITER $$

CREATE PROCEDURE reinitialize_user(IN aUser VARCHAR(100))
    BEGIN
         INSERT INTO cookieClickers(user, cookiesCount, clickCount) VALUES (aUser, 0, 0)
         ON DUPLICATE KEY UPDATE cookiesCount = 0, clickCount = 0, upgradeA = 0;
    END;$$
    
DELIMITER ;

-- Updating number of cookies
DROP PROCEDURE IF EXISTS updateCookieClicker;
DELIMITER $$

CREATE PROCEDURE updateCookieClicker(IN aUser VARCHAR(100), IN aCookiesCount INT, IN aClickCount INT)
    BEGIN
        INSERT INTO cookieClickers(user, cookiesCount, clickCount) VALUES (aUser, aCookiesCount, aClickCount)
        ON DUPLICATE KEY UPDATE cookiesCount = cookiesCount + aCookiesCount
            + upgradeA * (SELECT upgradeAmount FROM upgradeClick WHERE upgrade="upgradeA")
            + upgradeB * (SELECT upgradeAmount FROM upgradeClick WHERE upgrade="upgradeB")
            + upgradeC * (SELECT upgradeAmount FROM upgradeClick WHERE upgrade="upgradeC")
            + upgradeD * (SELECT upgradeAmount FROM upgradeClick WHERE upgrade="upgradeD")
            + upgradeE * (SELECT upgradeAmount FROM upgradeClick WHERE upgrade="upgradeE"),
        clickCount=clickCount+aClickCount;
    END;$$
    
DELIMITER ;

-- Updating the number of upgradeA
DROP PROCEDURE IF EXISTS updateUpgradeA;
DELIMITER $$

CREATE PROCEDURE updateUpgradeA(IN aUser VARCHAR(100), IN numUpgradeA INT)
    BEGIN
        INSERT INTO cookieClickers(user, upgradeA) VALUES (aUser, numUpgradeA)
        ON DUPLICATE KEY UPDATE upgradeA = upgradeA + numUpgradeA, cookiesCount = cookiesCount - (SELECT upgradeCost FROM upgradeClick WHERE upgrade="upgradeA");
    END;$$
    
DELIMITER ;

-- Updating the number of upgradeB
DROP PROCEDURE IF EXISTS updateUpgradeB;
DELIMITER $$

CREATE PROCEDURE updateUpgradeB(IN aUser VARCHAR(100), IN numUpgradeB INT)
    BEGIN
        INSERT INTO cookieClickers(user, upgradeB) VALUES (aUser, numUpgradeB)
        ON DUPLICATE KEY UPDATE upgradeB = upgradeB + numUpgradeB, cookiesCount = cookiesCount - (SELECT upgradeCost FROM upgradeClick WHERE upgrade="upgradeB");
    END;$$
    
DELIMITER ;

-- Updating the number of upgradeC
DROP PROCEDURE IF EXISTS updateUpgradeC;
DELIMITER $$

CREATE PROCEDURE updateUpgradeC(IN aUser VARCHAR(100), IN numUpgradeC INT)
    BEGIN
        INSERT INTO cookieClickers(user, upgradeC) VALUES (aUser, numUpgradeC)
        ON DUPLICATE KEY UPDATE upgradeC = upgradeC + numUpgradeC, cookiesCount = cookiesCount - (SELECT upgradeCost FROM upgradeClick WHERE upgrade="upgradeC");
    END;$$
    
DELIMITER ;

-- Updating the number of upgradeD
DROP PROCEDURE IF EXISTS updateUpgradeD;
DELIMITER $$

CREATE PROCEDURE updateUpgradeD(IN aUser VARCHAR(100), IN numUpgradeD INT)
    BEGIN
        INSERT INTO cookieClickers(user, upgradeD) VALUES (aUser, numUpgradeD)
        ON DUPLICATE KEY UPDATE upgradeD = upgradeD + numUpgradeD, cookiesCount = cookiesCount - (SELECT upgradeCost FROM upgradeClick WHERE upgrade="upgradeD");
    END;$$
    
DELIMITER ;

-- Updating the number of upgradeD
DROP PROCEDURE IF EXISTS updateUpgradeE;
DELIMITER $$

CREATE PROCEDURE updateUpgradeE(IN aUser VARCHAR(100), IN numUpgradeE INT)
    BEGIN
        INSERT INTO cookieClickers(user, upgradeE) VALUES (aUser, numUpgradeE)
        ON DUPLICATE KEY UPDATE upgradeE = upgradeE + numUpgradeE, cookiesCount = cookiesCount - (SELECT upgradeCost FROM upgradeClick WHERE upgrade="upgradeE");
    END;$$
    
DELIMITER ;
