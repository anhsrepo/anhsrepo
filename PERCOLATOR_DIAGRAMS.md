# Percolator Protocol - Mermaid Diagrams

> Comprehensive visual documentation of the Percolator Protocol architecture, flows, and components

**Repository:** https://github.com/aeyakovenko/percolator  
**Local Path:** `/Users/an/anhsrepo/percolator/`

---

## Table of Contents

1. [Mindmap - Conceptual Overview](#1-mindmap---conceptual-overview)
2. [Architecture Diagram](#2-architecture-diagram---system-components)
3. [Two-Phase Execution Flow](#3-two-phase-execution-flow)
4. [Slab Matching Engine Flow](#4-slab-matching-engine-flow)
5. [Anti-Toxicity Mechanisms](#5-anti-toxicity-mechanisms)
6. [Memory Layout](#6-memory-layout---slab-state-10-mb)
7. [Liquidation Flow](#7-liquidation-flow)
8. [Complete Codebase Structure](#8-complete-codebase-structure)
9. [Program ID and Deployment](#9-program-id-and-deployment)
10. [Instruction Flow Architecture](#10-instruction-flow-architecture)
11. [Data Type Relationships](#11-data-type-relationships)
12. [Anti-Toxicity Implementation Details](#12-anti-toxicity-implementation-details)
13. [Memory Pool Management](#13-memory-pool-management-10-mb-budget)
14. [Testing Architecture](#14-testing-architecture)
15. [Risk Calculation Flow](#15-risk-calculation-flow)

---

## 1. Mindmap - Conceptual Overview

```mermaid
mindmap
  root((PERCOLATOR<br/>PROTOCOL))
    ARCHITECTURE
      Sharded Perpetual Exchange
      Solana Based
      10MB State Budget
      Two-Phase Execution
    
    COMMON_LIBRARY
      TYPES
        Order
          OrderSide
          TimeInForce
          MakerClass
          OrderState
        Position
          entry_vwap
          unrealized_pnl
        Trade
          maker_id
          taker_id
          price, qty
      MATH
        calculate_vwap
        calculate_pnl
        calculate_funding
        calculate_margin_initial
        calculate_margin_maintenance
        round_to_tick
      ERROR
        PercolatorError
          InsufficientCollateral
          InvalidPrice
          PositionLimitExceeded
      ACCOUNT
        PDA helpers
      TESTS
        27 Unit Tests
    
    ROUTER_GLOBAL
      PURPOSE
        Collateral custody
        Portfolio margin
        Cross-slab coordination
      PDA
        derive_vault_pda
        derive_escrow_pda
        derive_cap_pda
        derive_portfolio_pda
        derive_registry_pda
      INSTRUCTIONS
        initialize
        deposit
        withdraw
        multi_reserve
          Lock liquidity
          Create Caps
        multi_commit
          Execute trades
          Update Portfolio
        liquidate
      STATE
        Vault
          Holds collateral
          mint, total_deposited
        Escrow
          Per user-slab-mint
          pledged_amount
        Cap
          Time-limited 2 min
          Debit authorization
        Portfolio
          Cross-margin tracking
          total_equity
          exposures
        Registry
          Slab whitelist
          version_hashes
    
    SLAB_LOCAL
      PURPOSE
        Order book
        Matching engine
        Risk management
      INSTRUCTIONS
        reserve
          Lock slices
          Calculate VWAP
        commit
          Execute at maker prices
          Create trades
        cancel
        batch_open
          50-100ms epochs
      MATCHING_ENGINE
        BOOK
          insert_order
          remove_order
          find_best_bid
          find_best_ask
          get_depth
        RESERVE_PHASE1
          lock_slices
          calculate_vwap
          calculate_worst_price
          check_capacity
        COMMIT_PHASE2
          execute_at_maker_prices
          create_trades
          update_positions
          release_slices
        RISK
          calculate_equity
          calculate_im
          calculate_mm
          check_liquidation
          calculate_funding
        ANTITOXIC
          detect_jit
            No rebate after batch_open
          check_kill_band
            Price spike protection
          apply_arg
            Aggressor Roundtrip Guard
          classify_maker
            DLP vs REG
      STATE
        Slab 10MB
          header
          accounts 5000
          orders 30000
          positions 30000
          reservations 4000
          slices 16000
          trades 10000
          instruments 32
        Header
          kill_band_bps
          im_ratio
          mm_ratio
          batch_window_ms
        Pools
          O1 freelist allocation
          alloc
          free
      TESTS
        19 Unit Tests
    
    FLOWS
      DEPOSIT
        User deposits collateral
        Router Vault
      MULTI_RESERVE
        Lock liquidity across slabs
        Calculate VWAP per slab
        Create time-limited Caps
      MULTI_COMMIT
        Execute at locked prices
        Generate trades
        Update positions
        Cross-margin calculation
      LIQUIDATION
        Detect underwater
        Grace window 5sec
        Force close
        Insurance fund
    
    TESTING
      Unit Tests 53
        common 27
        router 7
        slab 19
      Integration Tests
        reserve_commit
        portfolio
        anti_toxicity
      Property Tests
        Price-time invariants
        Value conservation
        No over-reservation
        Margin monotonicity
    
    KEY_PATTERNS
      Memory Management
        O1 freelist allocation
        Bounded memory
        No heap allocations
      Two-Phase Execution
        Reserve-Commit
        Time-limited capabilities
        Prevents front-running
      PDA-Based Accounts
        Deterministic addressing
        No signer required
      Fixed-Point Math
        6 decimal precision
        No floating-point errors
```

---

## 2. Architecture Diagram - System Components

```mermaid
graph TB
    subgraph User Layer
        U[User/Trader]
    end
    
    subgraph Router Layer - Global Aggregator
        R[Router Program]
        V[Vault - Collateral Storage]
        E[Escrow - User Pledges]
        C[Cap - Time-Limited Tokens]
        P[Portfolio - Cross-Margin]
        REG[Registry - Slab Whitelist]
    end
    
    subgraph Slab Layer - Local Markets
        S1[Slab 1 - BTC-PERP]
        S2[Slab 2 - ETH-PERP]
        S3[Slab N - SOL-PERP]
    end
    
    subgraph Slab Components
        OB[Order Book]
        ME[Matching Engine]
        RM[Risk Manager]
        AT[Anti-Toxicity]
    end
    
    subgraph Common Library
        T[Types - Order/Position/Trade]
        M[Math - VWAP/PnL/Margin]
        ERR[Error Handling]
    end
    
    U -->|1. Deposit| V
    U -->|2. Multi-Reserve| R
    R -->|Create Caps| C
    R -->|Reserve| S1
    R -->|Reserve| S2
    R -->|Reserve| S3
    U -->|3. Multi-Commit| R
    R -->|Commit with Cap| S1
    R -->|Commit with Cap| S2
    R -->|Commit with Cap| S3
    R -->|Update| P
    R -->|Pledge/Release| E
    
    S1 --> OB
    S1 --> ME
    S1 --> RM
    S1 --> AT
    
    R -.Uses.-> T
    R -.Uses.-> M
    S1 -.Uses.-> T
    S1 -.Uses.-> M
    
    style U fill:#4A90E2
    style R fill:#E27D60
    style S1 fill:#85DCB0
    style S2 fill:#85DCB0
    style S3 fill:#85DCB0
    style V fill:#E8A87C
    style P fill:#C38D9E
```

---

## 3. Two-Phase Execution Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as Router
    participant S1 as Slab 1
    participant S2 as Slab 2
    participant P as Portfolio
    
    Note over U,P: Phase 1: RESERVE (Lock Liquidity)
    
    U->>R: multi_reserve(orders)
    activate R
    
    R->>S1: reserve(order1)
    activate S1
    S1->>S1: Lock slices from order book
    S1->>S1: Calculate VWAP
    S1->>S1: Calculate worst price
    S1-->>R: reservation_id1, vwap1
    deactivate S1
    
    R->>S2: reserve(order2)
    activate S2
    S2->>S2: Lock slices from order book
    S2->>S2: Calculate VWAP
    S2->>S2: Calculate worst price
    S2-->>R: reservation_id2, vwap2
    deactivate S2
    
    R->>R: Create Cap tokens (2 min expiry)
    R-->>U: caps[], reservation_ids[]
    deactivate R
    
    Note over U,P: Phase 2: COMMIT (Execute Trades)
    
    U->>R: multi_commit(reservation_ids, caps)
    activate R
    
    R->>S1: commit(reservation_id1, cap1)
    activate S1
    S1->>S1: Verify cap not expired
    S1->>S1: Execute at locked maker prices
    S1->>S1: Create trade records
    S1->>S1: Update positions (maker + taker)
    S1->>S1: Apply JIT penalties if needed
    S1->>S1: Release locked slices
    S1-->>R: trades[], positions_updated
    deactivate S1
    
    R->>S2: commit(reservation_id2, cap2)
    activate S2
    S2->>S2: Verify cap not expired
    S2->>S2: Execute at locked maker prices
    S2->>S2: Create trade records
    S2->>S2: Update positions (maker + taker)
    S2->>S2: Apply JIT penalties if needed
    S2->>S2: Release locked slices
    S2-->>R: trades[], positions_updated
    deactivate S2
    
    R->>P: update(all_trades)
    activate P
    P->>P: Calculate cross-margin
    P->>P: Equity = cash + Σ unrealized_pnl
    P->>P: Check liquidation threshold
    P-->>R: portfolio_state
    deactivate P
    
    R-->>U: execution_report
    deactivate R
```

---

## 4. Slab Matching Engine Flow

```mermaid
flowchart TD
    Start([Order Arrives]) --> CheckBatch{Within Batch<br/>Window?}
    
    CheckBatch -->|Yes| WaitBatch[Wait for batch_open]
    CheckBatch -->|No| ClassifyMaker[Classify as DLP<br/>No rebate - JIT penalty]
    
    WaitBatch --> BatchOpen[Batch Opens<br/>50-100ms epoch]
    BatchOpen --> ClassifyNormal[Classify as DLP<br/>Gets maker rebate]
    
    ClassifyMaker --> InsertBook
    ClassifyNormal --> InsertBook[Insert into Order Book<br/>Price-Time Priority]
    
    InsertBook --> WaitTaker{Taker Order<br/>Arrives?}
    
    WaitTaker -->|Reserve| Reserve[Phase 1: Reserve]
    Reserve --> LockSlices[Lock slices from book]
    LockSlices --> CalcVWAP[Calculate VWAP]
    CalcVWAP --> CalcWorst[Calculate worst price]
    CalcWorst --> CheckCap{Sufficient<br/>Capacity?}
    
    CheckCap -->|No| RejectRes[Reject - Insufficient Liquidity]
    CheckCap -->|Yes| ReturnRes[Return reservation_id]
    
    ReturnRes --> WaitCommit{Commit<br/>Received?}
    
    WaitCommit -->|Timeout| Expire[Expire reservation<br/>Release slices]
    WaitCommit -->|Yes| Commit[Phase 2: Commit]
    
    Commit --> VerifyCap{Cap Valid<br/>& Not Expired?}
    VerifyCap -->|No| RejectCom[Reject - Invalid Cap]
    VerifyCap -->|Yes| KillBand{Within Kill<br/>Band?}
    
    KillBand -->|No| RejectKB[Reject - Price Spike]
    KillBand -->|Yes| Execute[Execute at maker prices]
    
    Execute --> CreateTrades[Create trade records]
    CreateTrades --> UpdatePos[Update positions<br/>maker + taker]
    UpdatePos --> CheckRisk{Risk Check}
    
    CheckRisk --> CalcEquity[Equity = cash + unrealized_pnl]
    CalcEquity --> CheckMM{Equity >= MM?}
    
    CheckMM -->|No| Liquidate[Flag for liquidation]
    CheckMM -->|Yes| ReleaseSlices[Release locked slices]
    
    ReleaseSlices --> Success([Trade Complete])
    Liquidate --> Success
    RejectRes --> End([End])
    RejectCom --> End
    RejectKB --> End
    Expire --> End
    
    style Start fill:#4A90E2
    style Success fill:#85DCB0
    style End fill:#E27D60
    style Liquidate fill:#FF6B6B
    style Execute fill:#95E1D3
```

---

## 5. Anti-Toxicity Mechanisms

```mermaid
graph LR
    subgraph Batch Window Protection
        BW[Batch Window<br/>50-100ms]
        BO[batch_open event]
        JIT[JIT Detection]
        
        BW --> BO
        BO --> JIT
    end
    
    subgraph Price Spike Protection
        KB[Kill Band<br/>basis points]
        PP[Price Check]
        REJ1[Reject if outside band]
        
        KB --> PP
        PP --> REJ1
    end
    
    subgraph Roundtrip Protection
        ARG[Aggressor Roundtrip Guard]
        CLIP[Clip overlapping legs]
        PREV[Prevent wash trading]
        
        ARG --> CLIP
        CLIP --> PREV
    end
    
    subgraph Maker Classification
        MC[Maker Class]
        DLP[DLP - Maker rebate]
        REG[REG - No rebate]
        
        MC --> DLP
        MC --> REG
    end
    
    JIT -.No rebate if after batch_open.-> REG
    PP -.Valid price.-> ARG
    CLIP -.Clean execution.-> MC
    
    style BW fill:#FFE66D
    style KB fill:#FF6B6B
    style ARG fill:#4ECDC4
    style MC fill:#95E1D3
```

---

## 6. Memory Layout - Slab State (10 MB)

```mermaid
graph TB
    subgraph Slab State - 10 MB Total
        H[Header<br/>Risk params, timestamps]
        
        subgraph Memory Pools - O1 Allocation
            AP[Accounts Pool<br/>5,000 slots]
            OP[Orders Pool<br/>30,000 slots]
            PP[Positions Pool<br/>30,000 slots]
            RP[Reservations Pool<br/>4,000 slots]
            SP[Slices Pool<br/>16,000 slots]
            TP[Trades Ring Buffer<br/>10,000 slots]
        end
        
        IP[Instruments Config<br/>32 instruments]
        FL[Freelist Allocators<br/>O1 alloc/free]
    end
    
    H --> AP
    H --> OP
    H --> PP
    H --> RP
    H --> SP
    H --> TP
    H --> IP
    
    FL -.Manages.-> AP
    FL -.Manages.-> OP
    FL -.Manages.-> PP
    FL -.Manages.-> RP
    FL -.Manages.-> SP
    
    style H fill:#FF6B6B
    style AP fill:#4ECDC4
    style OP fill:#45B7D1
    style PP fill:#96CEB4
    style RP fill:#FFEAA7
    style SP fill:#DFE6E9
    style TP fill:#A29BFE
    style IP fill:#FD79A8
    style FL fill:#FFE66D
```

---

## 7. Liquidation Flow

```mermaid
sequenceDiagram
    participant P as Portfolio
    participant R as Router
    participant L as Liquidator Bot
    participant S as Slab
    participant I as Insurance Fund
    
    Note over P,I: Continuous Monitoring
    
    P->>P: Calculate equity<br/>equity = cash + Σ unrealized_pnl
    P->>P: Check margin<br/>equity vs maintenance_margin
    
    alt Equity < Maintenance Margin
        P->>R: Flag liquidatable position
        R->>R: Start grace window (5 sec)
        R->>P: Recheck after grace period
        
        alt Still underwater
            R->>L: Emit liquidation event
            activate L
            
            L->>R: liquidate(user)
            R->>S: Force close positions
            activate S
            
            S->>S: Close at market price
            S->>S: Calculate loss
            
            alt Loss > Collateral
                S->>I: Request insurance fund
                I->>S: Cover shortfall
                S-->>R: Position closed (insurance used)
            else Loss <= Collateral
                S-->>R: Position closed (collateral sufficient)
            end
            
            deactivate S
            
            R->>P: Update portfolio
            P->>P: Mark position closed
            R-->>L: Liquidation complete + reward
            deactivate L
        else Recovered
            R->>P: Clear liquidation flag
        end
    else Healthy
        P->>P: Continue monitoring
    end
```

---

## 8. Complete Codebase Structure

```mermaid
graph TB
    subgraph Repository Root
        CT[Cargo.toml<br/>Workspace]
        CL[Cargo.lock]
        SP[Surfpool.toml<br/>Test Config]
        PM[plan.md<br/>Specification]
        RM[README.md]
        LIB[libintegration_reserve_commit.rlib]
    end
    
    subgraph programs/common
        CL1[lib.rs]
        CT1[types.rs<br/>Order/Position/Trade]
        CM1[math.rs<br/>VWAP/PnL/Margin]
        CE1[error.rs<br/>30+ Error Variants]
        CA1[account.rs<br/>PDA Helpers]
        CI1[instruction.rs<br/>Discriminators]
        CTst[tests.rs<br/>27 Unit Tests]
    end
    
    subgraph programs/router
        RL[lib.rs]
        RE[entrypoint.rs<br/>process_instruction]
        RP[pda.rs<br/>5 PDA Types]
        
        subgraph router/instructions
            RI1[initialize.rs]
            RI2[deposit.rs]
            RI3[withdraw.rs]
            RI4[multi_reserve.rs]
            RI5[multi_commit.rs]
            RI6[liquidate.rs]
            RIM[mod.rs<br/>Dispatcher]
        end
        
        subgraph router/state
            RS1[vault.rs<br/>Collateral Storage]
            RS2[escrow.rs<br/>User Pledges]
            RS3[cap.rs<br/>Time-Limited Tokens]
            RS4[portfolio.rs<br/>Cross-Margin]
            RS5[registry.rs<br/>Slab Whitelist]
            RSM[mod.rs<br/>State Traits]
        end
    end
    
    subgraph programs/slab
        SL[lib.rs]
        SE[entrypoint.rs<br/>process_instruction]
        SPD[pda.rs<br/>Slab PDA]
        
        subgraph slab/instructions
            SI1[reserve.rs<br/>Phase 1]
            SI2[commit.rs<br/>Phase 2]
            SI3[cancel.rs]
            SI4[batch_open.rs<br/>50-100ms Epochs]
            SIM[mod.rs<br/>Dispatcher]
        end
        
        subgraph slab/matching
            SM1[book.rs<br/>Order Book]
            SM2[reserve.rs<br/>Lock Slices]
            SM3[commit.rs<br/>Execute Trades]
            SM4[risk.rs<br/>Equity/IM/MM]
            SM5[antitoxic.rs<br/>JIT/Kill/ARG]
            SMM[mod.rs<br/>Engine Orchestrator]
        end
        
        subgraph slab/state
            SS1[slab.rs<br/>Main 10MB State]
            SS2[header.rs<br/>Risk Params]
            SS3[pools.rs<br/>O1 Freelists]
            SSM[mod.rs<br/>State Traits]
        end
        
        STst[tests.rs<br/>19 Unit Tests]
    end
    
    subgraph tests/
        T1[integration_reserve_commit.rs]
        T2[integration_portfolio.rs]
        T3[integration_anti_toxicity.rs]
        T4[property_invariants.rs]
        TREAD[README.md<br/>Test Strategy]
    end
    
    subgraph target/
        TD[debug/<br/>Build Artifacts]
        TL1[libpercolator_common.rlib]
        TL2[libpercolator_router.so]
        TL3[libpercolator_slab.so]
    end
    
    CT --> CL1
    CT --> RL
    CT --> SL
    
    CL1 --> CT1
    CL1 --> CM1
    CL1 --> CE1
    CL1 --> CA1
    CL1 --> CI1
    
    RL --> RE
    RL --> RP
    RL --> RIM
    RL --> RSM
    
    SL --> SE
    SL --> SPD
    SL --> SIM
    SL --> SMM
    SL --> SSM
    
    RIM --> RI1
    RIM --> RI2
    RIM --> RI3
    RIM --> RI4
    RIM --> RI5
    RIM --> RI6
    
    RSM --> RS1
    RSM --> RS2
    RSM --> RS3
    RSM --> RS4
    RSM --> RS5
    
    SIM --> SI1
    SIM --> SI2
    SIM --> SI3
    SIM --> SI4
    
    SMM --> SM1
    SMM --> SM2
    SMM --> SM3
    SMM --> SM4
    SMM --> SM5
    
    SSM --> SS1
    SSM --> SS2
    SSM --> SS3
    
    RL -.Uses.-> CL1
    SL -.Uses.-> CL1
    
    style CT fill:#FF6B6B
    style CL1 fill:#4ECDC4
    style RL fill:#E8A87C
    style SL fill:#95E1D3
    style RIM fill:#FFE66D
    style RSM fill:#A29BFE
    style SIM fill:#FFE66D
    style SMM fill:#FD79A8
    style SSM fill:#74B9FF
```

---

## 9. Program ID and Deployment

```mermaid
graph LR
    subgraph Solana Blockchain
        ROUTER_ID[Router Program<br/>RoutR1VdCpHqj89WEMJhb6TkGT9cPfr1rVjhM3e2YQr]
        SLAB_ID[Slab Program<br/>SlabXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX]
    end
    
    subgraph Router Accounts
        V1[Vault PDA<br/>seeds: vault, mint]
        E1[Escrow PDA<br/>seeds: escrow, user, slab, mint]
        C1[Cap PDA<br/>seeds: cap, user, slab, mint, nonce]
        P1[Portfolio PDA<br/>seeds: portfolio, user]
        R1[Registry PDA<br/>seeds: registry]
    end
    
    subgraph Slab Accounts
        S1[Slab PDA<br/>seeds: slab, instrument_name]
        S1A[10 MB Account<br/>Header + Pools]
    end
    
    ROUTER_ID --> V1
    ROUTER_ID --> E1
    ROUTER_ID --> C1
    ROUTER_ID --> P1
    ROUTER_ID --> R1
    
    SLAB_ID --> S1
    S1 --> S1A
    
    style ROUTER_ID fill:#E27D60
    style SLAB_ID fill:#85DCB0
    style V1 fill:#E8A87C
    style C1 fill:#FFE66D
    style P1 fill:#C38D9E
    style S1A fill:#95E1D3
```

---

## 10. Instruction Flow Architecture

```mermaid
graph TB
    subgraph Client Layer
        U[User/Aggregator Client]
        SDK[TypeScript/Rust SDK<br/>Future]
    end
    
    subgraph Router Instructions
        RI1[Initialize<br/>Setup Router State]
        RI2[Deposit<br/>Add Collateral]
        RI3[Withdraw<br/>Remove Collateral]
        RI4[MultiReserve<br/>Lock Multi-Slab]
        RI5[MultiCommit<br/>Execute Multi-Slab]
        RI6[Liquidate<br/>Close Underwater]
    end
    
    subgraph Slab Instructions
        SI1[Reserve<br/>Lock Liquidity]
        SI2[Commit<br/>Execute Trades]
        SI3[Cancel<br/>Cancel Reservation]
        SI4[BatchOpen<br/>Promote Pending]
    end
    
    subgraph Common Library
        CT[Types Module]
        CM[Math Module]
        CE[Error Module]
    end
    
    U --> SDK
    SDK --> RI1
    SDK --> RI2
    SDK --> RI3
    SDK --> RI4
    SDK --> RI5
    SDK --> RI6
    
    RI4 --> SI1
    RI5 --> SI2
    
    RI1 -.Uses.-> CT
    RI2 -.Uses.-> CM
    RI4 -.Uses.-> CM
    RI5 -.Uses.-> CM
    RI6 -.Uses.-> CM
    
    SI1 -.Uses.-> CT
    SI1 -.Uses.-> CM
    SI2 -.Uses.-> CT
    SI2 -.Uses.-> CM
    SI4 -.Uses.-> CT
    
    style U fill:#4A90E2
    style RI4 fill:#FFE66D
    style RI5 fill:#95E1D3
    style SI1 fill:#FFE66D
    style SI2 fill:#95E1D3
```

---

## 11. Data Type Relationships

```mermaid
classDiagram
    class Order {
        +u64 id
        +u32 instrument
        +OrderSide side
        +u64 qty
        +u64 limit_price
        +TimeInForce tif
        +OrderState state
        +MakerClass maker_class
        +u32 account_index
        +i64 timestamp
    }
    
    class Position {
        +u32 instrument
        +i64 qty
        +u64 entry_vwap
        +i64 unrealized_pnl
        +u64 initial_margin
        +u64 maintenance_margin
        +u32 account_index
    }
    
    class Trade {
        +u64 maker_id
        +u64 taker_id
        +u64 price
        +u64 qty
        +i64 timestamp
        +u32 instrument
        +bool maker_rebate
    }
    
    class Reservation {
        +u64 id
        +u64[] slice_indices
        +u64 locked_qty
        +u64 vwap
        +u64 worst_price
        +i64 expiry
        +u32 account_index
    }
    
    class Slice {
        +u64 order_id
        +u64 qty_locked
        +u64 price
    }
    
    class Account {
        +Pubkey user
        +u64 cash_balance
        +Position[] positions
        +Order[] orders
        +u32 account_index
    }
    
    class SlabState {
        +Header header
        +Account[] accounts
        +Order[] orders
        +Position[] positions
        +Reservation[] reservations
        +Slice[] slices
        +Trade[] trades
        +Instrument[] instruments
        +MemoryPools pools
    }
    
    class Vault {
        +Pubkey mint
        +u64 total_deposited
        +u64 total_pledged
        +Pubkey authority
    }
    
    class Escrow {
        +Pubkey user
        +Pubkey slab
        +Pubkey mint
        +u64 pledged_amount
        +u64 nonce
    }
    
    class Cap {
        +Pubkey user
        +Pubkey slab
        +Pubkey mint
        +u64 max_debit
        +i64 expiry
        +u64 used
    }
    
    class Portfolio {
        +Pubkey user
        +u64 total_equity
        +Exposure[] exposures
        +u64 total_im
        +u64 total_mm
    }
    
    Order --> Account
    Position --> Account
    Account --> SlabState
    Order --> Reservation
    Slice --> Reservation
    Trade --> SlabState
    
    Vault --> Portfolio
    Escrow --> Portfolio
    Cap --> Escrow
    
    Position --> Portfolio
```

---

## 12. Anti-Toxicity Implementation Details

```mermaid
graph TB
    subgraph Batch Window Mechanism
        BW1[Time t=0<br/>Batch Starts]
        BW2[Orders Posted<br/>State: PENDING]
        BW3[t=50-100ms<br/>batch_open Event]
        BW4[Promote PENDING → LIVE<br/>Eligible for matching]
        BW5[Orders after batch_open<br/>Classified as REG<br/>No maker rebate]
    end
    
    subgraph Kill Band Protection
        KB1[Mark Price<br/>Reference]
        KB2[Order Price<br/>Incoming]
        KB3{|Price - Mark| ><br/>kill_band_bps?}
        KB4[Accept Order]
        KB5[Reject Order<br/>Price Spike]
    end
    
    subgraph Aggressor Roundtrip Guard ARG
        ARG1[Taker Order<br/>Multi-leg]
        ARG2{Same user has<br/>opposing position?}
        ARG3[Clip overlapping qty]
        ARG4[Tax roundtrip]
        ARG5[Execute reduced qty]
        ARG6[Execute full qty]
    end
    
    subgraph JIT Detection
        JIT1[Order Posted]
        JIT2{Posted before<br/>batch_open?}
        JIT3[DLP Class<br/>Gets rebate]
        JIT4[REG Class<br/>No rebate]
    end
    
    BW1 --> BW2
    BW2 --> BW3
    BW3 --> BW4
    BW3 --> BW5
    
    KB1 --> KB3
    KB2 --> KB3
    KB3 -->|No| KB4
    KB3 -->|Yes| KB5
    
    ARG1 --> ARG2
    ARG2 -->|Yes| ARG3
    ARG3 --> ARG4
    ARG4 --> ARG5
    ARG2 -->|No| ARG6
    
    JIT1 --> JIT2
    JIT2 -->|Yes| JIT3
    JIT2 -->|No| JIT4
    
    style BW3 fill:#FFE66D
    style KB5 fill:#FF6B6B
    style ARG3 fill:#FD79A8
    style JIT4 fill:#FF6B6B
```

---

## 13. Memory Pool Management (10 MB Budget)

```mermaid
graph TB
    subgraph Slab Account 10 MB
        H[Header: 1 KB<br/>Risk params, timestamps]
        
        subgraph Accounts Pool
            AP1[Slot 0: Free]
            AP2[Slot 1: Active]
            AP3[Slot 2: Active]
            APD[...]
            AP5000[Slot 4999: Free]
        end
        
        subgraph Orders Pool
            OP1[Slot 0: Order A]
            OP2[Slot 1: Free]
            OPD[...]
            OP30K[Slot 29999: Order Z]
        end
        
        subgraph Positions Pool
            PP1[Slot 0: Position X]
            PP2[Slot 1: Free]
            PPD[...]
            PP30K[Slot 29999: Position Y]
        end
        
        subgraph Reservations Pool
            RP1[Slot 0: Active]
            RP2[Slot 1: Expired]
            RPD[...]
            RP4K[Slot 3999: Active]
        end
        
        subgraph Slices Pool
            SP1[Slice locked]
            SP2[Slice locked]
            SPD[...]
            SP16K[Slot 15999: Free]
        end
        
        subgraph Trades Ring Buffer
            TR1[Trade 0: Oldest]
            TR2[Trade 1]
            TRD[...]
            TR10K[Trade 9999: Newest]
        end
        
        FL[Freelist Head Pointers<br/>O1 alloc/free]
    end
    
    H --> AP1
    H --> OP1
    H --> PP1
    H --> RP1
    H --> SP1
    H --> TR1
    
    FL -.Manages.-> AP1
    FL -.Manages.-> OP1
    FL -.Manages.-> PP1
    FL -.Manages.-> RP1
    FL -.Manages.-> SP1
    
    TR1 -.Circular.-> TR10K
    TR10K -.Wraps to.-> TR1
    
    style H fill:#FF6B6B
    style AP2 fill:#4ECDC4
    style OP1 fill:#45B7D1
    style PP1 fill:#96CEB4
    style RP1 fill:#FFEAA7
    style SP1 fill:#DFE6E9
    style TR1 fill:#A29BFE
    style FL fill:#FFE66D
```

---

## 14. Testing Architecture

```mermaid
graph TB
    subgraph Unit Tests 53 Total
        UT1[common/tests.rs<br/>27 tests]
        UT2[router/tests<br/>7 tests]
        UT3[slab/tests.rs<br/>19 tests]
    end
    
    subgraph Integration Tests Templates
        IT1[integration_reserve_commit.rs<br/>2-phase flow]
        IT2[integration_portfolio.rs<br/>Cross-margin]
        IT3[integration_anti_toxicity.rs<br/>JIT/Kill/ARG]
    end
    
    subgraph Property Tests
        PT1[property_invariants.rs<br/>Invariant checks]
        PT2[Price-time priority]
        PT3[Value conservation]
        PT4[No over-reservation]
        PT5[Margin monotonicity]
    end
    
    subgraph Test Infrastructure
        SP1[Surfpool.toml<br/>Config]
        SP2[.surfpool/runbooks/<br/>txtx files]
        SP3[Local Validator<br/>Mainnet state]
    end
    
    subgraph Build & Deploy
        B1[cargo build-sbf<br/>Solana Platform Tools]
        B2[Deploy to local validator]
        B3[Measure CU consumption]
    end
    
    UT1 --> IT1
    UT2 --> IT1
    UT3 --> IT1
    
    IT1 --> PT1
    IT2 --> PT1
    IT3 --> PT1
    
    PT1 --> PT2
    PT1 --> PT3
    PT1 --> PT4
    PT1 --> PT5
    
    SP1 --> SP2
    SP2 --> SP3
    SP3 --> IT1
    
    B1 --> B2
    B2 --> IT1
    B2 --> B3
    
    style UT1 fill:#85DCB0
    style IT1 fill:#FFE66D
    style PT1 fill:#A29BFE
    style SP3 fill:#4ECDC4
    style B1 fill:#E27D60
```

---

## 15. Risk Calculation Flow

```mermaid
flowchart TD
    Start([Position Update]) --> GetPos[Get Position Data<br/>instrument, qty, entry_vwap]
    
    GetPos --> GetMark[Get Mark Price<br/>From oracle/index]
    
    GetMark --> CalcUnreal[Calculate Unrealized PnL<br/>pnl = qty × mark - entry_vwap]
    
    CalcUnreal --> GetCash[Get Cash Balance]
    
    GetCash --> CalcEquity[Calculate Equity<br/>equity = cash + Σ unrealized_pnl]
    
    CalcEquity --> CalcIM[Calculate Initial Margin<br/>IM = Σ abs_qty × mark × im_ratio]
    
    CalcIM --> CalcMM[Calculate Maintenance Margin<br/>MM = Σ abs_qty × mark × mm_ratio]
    
    CalcMM --> CheckIM{equity >= IM?}
    
    CheckIM -->|No| RejectNew[Reject New Position<br/>Insufficient margin]
    CheckIM -->|Yes| CheckMM{equity >= MM?}
    
    CheckMM -->|No| FlagLiq[Flag for Liquidation<br/>Start grace period]
    CheckMM -->|Yes| Healthy[Position Healthy<br/>Continue monitoring]
    
    FlagLiq --> Grace{Grace period<br/>5 seconds}
    
    Grace -->|Recovered| Healthy
    Grace -->|Still underwater| Liquidate[Trigger Liquidation]
    
    Liquidate --> ForceClose[Force Close at Market]
    ForceClose --> CalcLoss[Calculate Loss]
    
    CalcLoss --> Insurance{Loss ><br/>Collateral?}
    
    Insurance -->|Yes| UseInsurance[Use Insurance Fund]
    Insurance -->|No| UseCollateral[Deduct from Collateral]
    
    UseInsurance --> Complete([Liquidation Complete])
    UseCollateral --> Complete
    Healthy --> Monitor[Continue Monitoring]
    RejectNew --> End([End])
    
    style Start fill:#4A90E2
    style CalcEquity fill:#95E1D3
    style FlagLiq fill:#FFE66D
    style Liquidate fill:#FF6B6B
    style Complete fill:#85DCB0
    style Healthy fill:#85DCB0
```

---

## Key Concepts Summary

### Two-Phase Execution
- **Phase 1 (Reserve)**: Lock liquidity, calculate VWAP, create time-limited capability tokens
- **Phase 2 (Commit)**: Execute at locked prices within 2-minute window

### Anti-Toxicity Protections
1. **Batch Windows**: 50-100ms epochs for fair order matching
2. **JIT Penalty**: Orders after `batch_open` get no maker rebate
3. **Kill Band**: Reject orders outside price spike threshold
4. **ARG**: Clip overlapping legs to prevent wash trading

### Memory Management
- **O(1) Freelist Allocation**: Deterministic, bounded memory
- **10 MB State Budget**: Enforced at compile-time
- **No Heap Allocations**: Pure stack-based execution

### Program IDs
- **Router**: `RoutR1VdCpHqj89WEMJhb6TkGT9cPfr1rVjhM3e2YQr`
- **Slab**: TBD (per deployment)

---

**Last Updated**: October 20, 2025  
**Source**: https://github.com/aeyakovenko/percolator

