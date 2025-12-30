# PRISUM-Simulator

PRISUM-Simulator is a modular simulation environment designed to analyze and evaluate information propagation processes in **Online Social Networks (OSNs)**.  
It operationalizes the **PRISUM-Model (Propagation–Representation–Integration of Structure, User, and Message)**, a holistic propagation model that integrates network topology, user behavior, and message affective characteristics within a unified simulation system.

---

## Overview

Information propagation in OSNs is a complex process shaped by the interaction between structural constraints, heterogeneous user behavior, and the affective properties of the content being diffused.  
PRISUM-Simulator provides a controlled and reproducible environment to study these interactions through simulation-based experimentation.

The simulator supports comparative analysis between the PRISUM-Model and classical epidemiological propagation models, enabling systematic evaluation under equivalent experimental conditions.

---

## Core Capabilities

- Simulation of information propagation as an emergent process driven by:
  - Network structure
  - User behavioral and affective profiles
  - Message affective characteristics

- Support for multiple network configurations:
  - Empirical hybrid networks (conversational and structural relations)
  - Synthetic networks generated using BA and HK models

- User-centered propagation modeling:
  - Profile-based seed selection
  - Heterogeneous behavioral responses

- Message representation using affective vectors:
  - Subjectivity
  - Polarity
  - Primary emotions

- Multiple propagation engines:
  - PRISUM-Model
  - Classical SIR
  - Classical SIS

- Reproducible experimental execution with explicit control of parameters and variables

---

## Architecture

PRISUM-Simulator follows a modular, layered architecture:

- **Processing layer**
  - Network construction
  - Message processing
  - Propagation engines
  - Synthetic data generation

- **Interaction layer**
  - Experimental configuration
  - Simulation execution
  - Result inspection and visualization

This separation enables extensibility, controlled experimentation, and direct comparison between different propagation models.

---

## Research Context

PRISUM-Simulator was developed as part of a doctoral research project focused on the analysis and control of information propagation in Online Social Networks.  
The simulator serves as the operational bridge between a formal propagation model and empirical simulation-based analysis.

The code is provided for **research and academic purposes**, with an emphasis on transparency and reproducibility.

---

## Reproducibility

The repository includes:
- Source code of the simulator
- Configuration files
- Execution instructions
- Example experimental scenarios

The structure of the codebase reflects the state of the simulator at the time of the doctoral study.

---

## Usage

The simulator is executed as a Python-based application.  
Detailed execution instructions and configuration examples are provided within the repository.

---

## Notes

- This project is intended for simulation and experimentation, not for production deployment.
- The implementation prioritizes methodological clarity and reproducibility over software optimization.
- The code is released as-is to support inspection, reuse, and extension in academic contexts.

---

## License

This project is released for academic and research use.  
Please cite the associated doctoral work when using or extending this simulator.
