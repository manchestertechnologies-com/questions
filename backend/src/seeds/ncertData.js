const ncertSyllabus = [
  // ==================== PHYSICS CLASS 11 ====================
  {
    subjectName: "Physics",
    classNum: 11,
    chapters: [
      {
        name: "Units and Measurements",
        concepts: [
          {
            name: "Dimensions of Physical Quantities",
            subConcepts: ["Dimensional Formulae", "Dimensional Analysis Applications", "Limitations of Dimensional Analysis"]
          },
          {
            name: "Errors in Measurement",
            subConcepts: ["Absolute and Relative Error", "Percentage Error", "Combination of Errors", "Significant Figures Rules"]
          }
        ]
      },
      {
        name: "Motion in a Straight Line",
        concepts: [
          {
            name: "Kinematic Equations",
            subConcepts: ["Equations of Motion", "Free Fall Calculations", "Stopping Distance", "Reaction Time"]
          },
          {
            name: "Position and Velocity",
            subConcepts: ["Frame of Reference", "Average Speed and Velocity", "Instantaneous Velocity", "Relative Velocity"]
          }
        ]
      },
      {
        name: "Motion in a Plane",
        concepts: [
          {
            name: "Vectors and Scalars",
            subConcepts: ["Vector Addition Laws", "Resolution of Vectors", "Dot and Cross Products", "Unit Vectors"]
          },
          {
            name: "Projectile Motion",
            subConcepts: ["Trajectory Equation", "Time of Flight", "Maximum Height", "Horizontal Range"]
          },
          {
            name: "Uniform Circular Motion",
            subConcepts: ["Angular Velocity and Acceleration", "Centripetal Acceleration", "Centripetal Force Applications"]
          }
        ]
      },
      {
        name: "Laws of Motion",
        concepts: [
          {
            name: "Newton's Laws of Motion",
            subConcepts: ["Inertia and Force", "Linear Momentum", "Impulse and Impulse-Momentum Theorem", "Action-Reaction Principle"]
          },
          {
            name: "Friction",
            subConcepts: ["Static and Kinetic Friction", "Coefficient of Friction", "Angle of Friction", "Banking of Roads"]
          },
          {
            name: "Circular Motion Dynamics",
            subConcepts: ["Bending of a Cyclist", "Motion in a Vertical Circle", "Centrifugal Force"]
          }
        ]
      },
      {
        name: "Work, Energy and Power",
        concepts: [
          {
            name: "Work and Kinetic Energy",
            subConcepts: ["Work Done by Constant Force", "Work Done by Variable Force", "Work-Energy Theorem", "Kinetic Energy Derivation"]
          },
          {
            name: "Potential Energy and Conservation",
            subConcepts: ["Conservative and Non-conservative Forces", "Spring Potential Energy", "Conservation of Mechanical Energy", "Power and Efficiency"]
          },
          {
            name: "Collisions",
            subConcepts: ["Elastic Collision in 1D and 2D", "Inelastic Collision", "Coefficient of Restitution", "Loss of KE in Inelastic Collision"]
          }
        ]
      },
      {
        name: "System of Particles and Rotational Motion",
        concepts: [
          {
            name: "Centre of Mass",
            subConcepts: ["Two-particle System COM", "Rigid Body COM", "Motion of Centre of Mass", "Linear Momentum of a System"]
          },
          {
            name: "Rotational Kinematics and Dynamics",
            subConcepts: ["Torque and Angular Momentum", "Equilibrium of a Rigid Body", "Moment of Inertia", "Parallel and Perpendicular Axes Theorems"]
          }
        ]
      },
      {
        name: "Gravitation",
        concepts: [
          {
            name: "Kepler's Laws and Gravity",
            subConcepts: ["Kepler's Laws of Planetary Motion", "Newton's Universal Law of Gravitation", "Acceleration due to Gravity (g)", "Variation of g with Altitude and Depth"]
          },
          {
            name: "Gravitational Potential Energy and Satellites",
            subConcepts: ["Gravitational Potential", "Escape Velocity", "Orbital Velocity of Satellites", "Geostationary and Polar Satellites"]
          }
        ]
      },
      {
        name: "Mechanical Properties of Solids",
        concepts: [
          {
            name: "Elastic Behaviour",
            subConcepts: ["Stress and Strain Relations", "Hooke's Law", "Young's, Shear, and Bulk Modulus", "Poisson's Ratio"]
          }
        ]
      },
      {
        name: "Mechanical Properties of Fluids",
        concepts: [
          {
            name: "Fluid Statics",
            subConcepts: ["Pressure and Pascal's Law", "Archimedes Principle", "Atmospheric Pressure Measurement"]
          },
          {
            name: "Fluid Dynamics",
            subConcepts: ["Streamline and Turbulent Flow", "Equation of Continuity", "Bernoulli's Principle and Applications", "Torricelli's Law and Venturi-meter"]
          },
          {
            name: "Surface Tension and Viscosity",
            subConcepts: ["Surface Energy", "Angle of Contact", "Capillary Rise", "Viscosity and Stokes' Law", "Terminal Velocity"]
          }
        ]
      },
      {
        name: "Thermal Properties of Matter",
        concepts: [
          {
            name: "Temperature and Heat",
            subConcepts: ["Thermometry Scales", "Thermal Expansion of Solids/Liquids/Gases", "Specific Heat Capacity", "Calorimetry Principal"]
          },
          {
            name: "Heat Transfer",
            subConcepts: ["Conduction and Thermal Conductivity", "Convection Mechanisms", "Radiation and Stefan's Law", "Wien's Displacement Law", "Newton's Law of Cooling"]
          }
        ]
      },
      {
        name: "Thermodynamics",
        concepts: [
          {
            name: "Laws of Thermodynamics",
            subConcepts: ["Zeroth Law and Temperature", "First Law (Internal Energy, Heat, Work)", "Thermodynamic Processes (Isothermal, Adiabatic)", "Second Law (Reversible and Irreversible Processes)"]
          },
          {
            name: "Heat Engines and Refrigerators",
            subConcepts: ["Carnot Cycle Efficiency", "Refrigerator Coefficient of Performance"]
          }
        ]
      },
      {
        name: "Kinetic Theory of Gases",
        concepts: [
          {
            name: "Ideal Gas Behavior",
            subConcepts: ["Gas Laws Review", "Kinetic Theory Postulates", "Pressure of an Ideal Gas", "RMS Speed of Gas Molecules"]
          },
          {
            name: "Equipartition of Energy",
            subConcepts: ["Degrees of Freedom", "Law of Equipartition of Energy", "Specific Heat Capacities of Gases", "Mean Free Path"]
          }
        ]
      },
      {
        name: "Oscillations",
        concepts: [
          {
            name: "Simple Harmonic Motion",
            subConcepts: ["SHM Equations of Motion", "Displacement, Velocity, and Acceleration", "Energy in SHM (Kinetic and Potential)", "Simple Pendulum Time Period", "Spring Mass System Oscillations"]
          }
        ]
      },
      {
        name: "Waves",
        concepts: [
          {
            name: "Wave Motion",
            subConcepts: ["Transverse and Longitudinal Waves", "Speed of Wave in Medium", "Newton's Formula and Laplace's Correction"]
          },
          {
            name: "Superposition and Sound",
            subConcepts: ["Superposition Principle", "Standing Waves in Pipes and Strings", "Beats Phenomenon", "Doppler Effect in Sound"]
          }
        ]
      }
    ]
  },

  // ==================== PHYSICS CLASS 12 ====================
  {
    subjectName: "Physics",
    classNum: 12,
    chapters: [
      {
        name: "Electric Charges and Fields",
        concepts: [
          {
            name: "Coulomb's Law and Electric Field",
            subConcepts: ["Coulomb's Law in Vector Form", "Superposition Principle", "Electric Field due to Point Charges", "Electric Field Lines Properties"]
          },
          {
            name: "Electric Dipole",
            subConcepts: ["Electric Field on Axial Line", "Electric Field on Equatorial Line", "Torque on Dipole in Uniform Field"]
          },
          {
            name: "Gauss's Law",
            subConcepts: ["Electric Flux", "Gauss's Theorem", "Field due to Infinitely Long Straight Wire", "Field due to Uniformly Charged Thin Spherical Shell"]
          }
        ]
      },
      {
        name: "Electrostatic Potential and Capacitance",
        concepts: [
          {
            name: "Electrostatic Potential",
            subConcepts: ["Potential due to Point Charge", "Potential due to Dipole", "Equipotential Surfaces", "Relation between E and V"]
          },
          {
            name: "Capacitance",
            subConcepts: ["Parallel Plate Capacitor", "Dielectrics Effect on Capacitance", "Combination of Capacitors (Series/Parallel)", "Energy Stored in Capacitor"]
          }
        ]
      },
      {
        name: "Current Electricity",
        concepts: [
          {
            name: "Ohm's Law and Drift Velocity",
            subConcepts: ["Electric Current and Drift Speed", "Ohm's Law Derivation", "Resistivity and Temperature Dependency", "Electrical Energy and Power"]
          },
          {
            name: "DC Circuits and Cells",
            subConcepts: ["EMF and Internal Resistance of Cell", "Combination of Cells", "Kirchhoff's Rules", "Wheatstone Bridge and Meter Bridge", "Potentiometer Principles"]
          }
        ]
      },
      {
        name: "Moving Charges and Magnetism",
        concepts: [
          {
            name: "Magnetic Fields and Biot-Savart Law",
            subConcepts: ["Biot-Savart Law Application", "Magnetic Field of Circular Loop", "Ampere's Circuital Law", "Solenoid and Toroid Fields"]
          },
          {
            name: "Magnetic Forces",
            subConcepts: ["Force on Moving Charge (Lorentz Force)", "Cyclotron Mechanics", "Force on Current-Carrying Conductor", "Force between Two Parallel Currents"]
          },
          {
            name: "Torque and Galvanometer",
            subConcepts: ["Torque on Current Loop", "Moving Coil Galvanometer", "Conversion to Ammeter and Voltmeter"]
          }
        ]
      },
      {
        name: "Magnetism and Matter",
        concepts: [
          {
            name: "Bar Magnet and Earth's Magnetism",
            subConcepts: ["Bar Magnet as Equivalent Solenoid", "Magnetic Field Intensity", "Earth's Magnetic Elements (Declination, Dip)"]
          },
          {
            name: "Magnetic Properties of Materials",
            subConcepts: ["Diamagnetism", "Paramagnetism", "Ferromagnetism", "Curie Temperature and Hysteresis"]
          }
        ]
      },
      {
        name: "Electromagnetic Induction",
        concepts: [
          {
            name: "Faraday's and Lenz's Laws",
            subConcepts: ["Magnetic Flux", "Faraday's Laws of Induction", "Lenz's Law and Conservation of Energy", "Motional EMF"]
          },
          {
            name: "Inductance",
            subConcepts: ["Self-Induction and Mutual Induction", "Inductance of Solenoid", "Eddy Currents and Applications", "AC Generator Principle"]
          }
        ]
      },
      {
        name: "Alternating Current",
        concepts: [
          {
            name: "AC Circuits Basics",
            subConcepts: ["RMS and Peak Values", "AC applied to Resistor, Inductor, and Capacitor", "Phasor Diagram Representation"]
          },
          {
            name: "LCR Series Circuit",
            subConcepts: ["Impedance and Reactance", "Resonance in LCR Circuit", "Q-factor", "Power in AC Circuits and Power Factor", "Wattless Current"]
          },
          {
            name: "Transformers",
            subConcepts: ["Step-up and Step-down Transformers", "Energy Losses in Transformers"]
          }
        ]
      },
      {
        name: "Electromagnetic Waves",
        concepts: [
          {
            name: "Displacement Current and EM Spectrum",
            subConcepts: ["Maxwell's Equations Summary", "Displacement Current Need", "Characteristics of EM Waves", "Electromagnetic Spectrum Frequencies and Uses"]
          }
        ]
      },
      {
        name: "Ray Optics and Optical Instruments",
        concepts: [
          {
            name: "Spherical Mirrors and Refraction",
            subConcepts: ["Mirror Formula", "Refraction and Snell's Law", "Total Internal Reflection Applications", "Optical Fibres"]
          },
          {
            name: "Lenses and Prisms",
            subConcepts: ["Refraction at Spherical Surfaces", "Lens Maker's Formula", "Power of Lens", "Refraction through Prism and Dispersion"]
          },
          {
            name: "Optical Instruments",
            subConcepts: ["Microscope (Simple and Compound)", "Astronomical Telescope (Refracting and Reflecting)", "Magnifying Power"]
          }
        ]
      },
      {
        name: "Wave Optics",
        concepts: [
          {
            name: "Huygens Principle",
            subConcepts: ["Wavefronts and Huygens Principle", "Refraction and Reflection Proofs"]
          },
          {
            name: "Interference of Light",
            subConcepts: ["Coherent Sources", "Young's Double Slit Experiment (YDSE)", "Fringe Width Expression", "Constructive and Destructive Interference"]
          },
          {
            name: "Diffraction and Polarisation",
            subConcepts: ["Diffraction due to Single Slit", "Width of Central Maxima", "Brewster's Law", "Polaroid Applications"]
          }
        ]
      },
      {
        name: "Dual Nature of Radiation and Matter",
        concepts: [
          {
            name: "Photoelectric Effect",
            subConcepts: ["Hertz and Lenard's Observations", "Einstein's Photoelectric Equation", "Threshold Frequency", "Stopping Potential Relationships"]
          },
          {
            name: "De Broglie Hypothesis",
            subConcepts: ["Wave Nature of Matter", "De Broglie Wavelength", "Davisson-Germer Experiment"]
          }
        ]
      },
      {
        name: "Atoms",
        concepts: [
          {
            name: "Atomic Models",
            subConcepts: ["Alpha-particle Scattering Experiment", "Rutherford Model Limitations", "Bohr Model Postulates", "Radius and Velocity of Electron in Orbit", "Hydrogen Line Spectra"]
          }
        ]
      },
      {
        name: "Nuclei",
        concepts: [
          {
            name: "Nuclear Structure",
            subConcepts: ["Composition and Size of Nucleus", "Mass Defect and Binding Energy", "Binding Energy per Nucleon Curve"]
          },
          {
            name: "Radioactivity and Fission",
            subConcepts: ["Radioactive Decay Law", "Half-life and Mean Life", "Alpha, Beta, Gamma Decays", "Nuclear Fission and Fusion"]
          }
        ]
      },
      {
        name: "Semiconductor Electronics: Materials, Devices and Simple Circuits",
        concepts: [
          {
            name: "Semiconductors and Junction Diodes",
            subConcepts: ["Energy Bands in Solids (Metals/Semiconductors/Insulators)", "Intrinsic and Extrinsic Semiconductors (n-type and p-type)", "p-n Junction formation"]
          },
          {
            name: "Diode Applications and Logic Gates",
            subConcepts: ["p-n Junction Diode as Rectifier (Half and Full Wave)", "Zener Diode as Voltage Regulator", "LED, Photodiode, Solar Cell", "Logic Gates (AND, OR, NOT, NAND, NOR)"]
          }
        ]
      }
    ]
  },

  // ==================== CHEMISTRY CLASS 11 ====================
  {
    subjectName: "Chemistry",
    classNum: 11,
    chapters: [
      {
        name: "Some Basic Concepts of Chemistry",
        concepts: [
          {
            name: "Laws of Chemical Combinations",
            subConcepts: ["Law of Conservation of Mass", "Law of Definite Proportions", "Law of Multiple Proportions", "Gay Lussac's Law of Gaseous Volumes"]
          },
          {
            name: "Stoichiometry and Concentration",
            subConcepts: ["Mole Concept and Molar Mass", "Empirical and Molecular Formulae", "Stoichiometric Calculations", "Limiting Reagent", "Molarity, Molality, Mole Fraction"]
          }
        ]
      },
      {
        name: "Structure of Atom",
        concepts: [
          {
            name: "Bohr's Model and Quantum Theory",
            subConcepts: ["Planck's Quantum Theory", "Bohr Model of Hydrogen Atom", "Line Spectrum of Hydrogen", "Heisenberg's Uncertainty Principle"]
          },
          {
            name: "Quantum Mechanical Model",
            subConcepts: ["Quantum Numbers (n, l, m, s)", "Shapes of s, p, d Orbitals", "Aufbau Principle", "Pauli's Exclusion Principle", "Hund's Rule of Maximum Multiplicity"]
          }
        ]
      },
      {
        name: "Classification of Elements and Periodicity in Properties",
        concepts: [
          {
            name: "Periodic Table History and Trends",
            subConcepts: ["Modern Periodic Law", "Electronic Configuration of Elements", "Periodic Trends in Atomic Radii", "Periodic Trends in Ionization Enthalpy", "Electron Gain Enthalpy and Electronegativity"]
          }
        ]
      },
      {
        name: "Chemical Bonding and Molecular Structure",
        concepts: [
          {
            name: "Ionic and Covalent Bonding",
            subConcepts: ["Kossel-Lewis Approach", "Octet Rule and Formal Charge", "Lattice Enthalpy", "Fajans' Rules"]
          },
          {
            name: "Valence Shell Electron Pair Repulsion (VSEPR) Theory",
            subConcepts: ["VSEPR Geometry of Molecules", "Hybridisation (sp, sp2, sp3, dsp2, sp3d, sp3d2)", "Dipole Moment"]
          },
          {
            name: "Molecular Orbital (MO) Theory",
            subConcepts: ["LCAO Method", "Bond Order", "Magnetic Properties of Diatomic Molecules", "Hydrogen Bonding"]
          }
        ]
      },
      {
        name: "Chemical Thermodynamics",
        concepts: [
          {
            name: "First Law of Thermodynamics",
            subConcepts: ["State Functions", "Work, Heat, and Internal Energy", "Enthalpy and Enthalpy Changes (Hess's Law)", "Heat Capacity"]
          },
          {
            name: "Second Law and Spontaneity",
            subConcepts: ["Entropy Change (S)", "Gibbs Free Energy (G)", "Spontaneity Criteria (G = H - TS)", "Relation between Gibbs Free Energy and Equilibrium Constant"]
          }
        ]
      },
      {
        name: "Equilibrium",
        concepts: [
          {
            name: "Chemical Equilibrium",
            subConcepts: ["Law of Chemical Equilibrium", "Equilibrium Constants (Kp, Kc)", "Le Chatelier's Principle"]
          },
          {
            name: "Ionic Equilibrium",
            subConcepts: ["Arrhenius, Bronsted-Lowry, and Lewis Acids/Bases", "Ionization of Water and pH Scale", "Common Ion Effect", "Buffer Solutions", "Solubility Product (Ksp)"]
          }
        ]
      },
      {
        name: "Redox Reactions",
        concepts: [
          {
            name: "Redox Processes",
            subConcepts: ["Oxidation Number Concept", "Balancing Redox Reactions (Half-reaction/Oxidation Number methods)", "Electrochemical Cells Intro"]
          }
        ]
      },
      {
        name: "Organic Chemistry – Some Basic Principles and Techniques",
        concepts: [
          {
            name: "IUPAC Nomenclature and Structures",
            subConcepts: ["Classification of Organic Compounds", "Rules for IUPAC Nomenclature", "Isomerism (Structural and Stereoisomerism)"]
          },
          {
            name: "Reaction Mechanisms",
            subConcepts: ["Fission of Covalent Bond", "Electrophiles and Nucleophiles", "Inductive Effect and Electromeric Effect", "Resonance and Hyperconjugation", "Carbocations, Carbanions, and Free Radicals"]
          },
          {
            name: "Purification and Quantitative Analysis",
            subConcepts: ["Chromatography Techniques", "Estimation of Nitrogen (Dumas and Kjeldahl methods)", "Estimation of Halogens (Carius method)"]
          }
        ]
      },
      {
        name: "Hydrocarbons",
        concepts: [
          {
            name: "Alkanes",
            subConcepts: ["Preparation methods", "Conformations of Ethane", "Halogenation Mechanism"]
          },
          {
            name: "Alkenes and Alkynes",
            subConcepts: ["Geometrical Isomerism", "Markovnikov's and Anti-Markovnikov's addition", "Ozonolysis of Alkenes", "Acidity of Alkynes"]
          },
          {
            name: "Aromatic Hydrocarbons",
            subConcepts: ["Benzene Structure and Huckel's Rule", "Electrophilic Substitution Reactions (Nitration, Friedel-Crafts)", "Directive Influence of Functional Groups"]
          }
        ]
      }
    ]
  },

  // ==================== CHEMISTRY CLASS 12 ====================
  {
    subjectName: "Chemistry",
    classNum: 12,
    chapters: [
      {
        name: "Solutions",
        concepts: [
          {
            name: "Solubility and Vapor Pressure",
            subConcepts: ["Henry's Law", "Raoult's Law for Liquid-Liquid Solutions", "Ideal and Non-ideal Solutions", "Azeotropes"]
          },
          {
            name: "Colligative Properties",
            subConcepts: ["Relative Lowering of Vapor Pressure", "Elevation of Boiling Point", "Depression of Freezing Point", "Osmotic Pressure", "Abnormal Molar Masses and Van't Hoff Factor"]
          }
        ]
      },
      {
        name: "Electrochemistry",
        concepts: [
          {
            name: "Galvanic Cells and Nernst Equation",
            subConcepts: ["Electrode Potential", "Nernst Equation Applications", "Relation between Cell Potential and Gibbs Free Energy"]
          },
          {
            name: "Conductance and Electrolysis",
            subConcepts: ["Kohlrausch's Law", "Faraday's Laws of Electrolysis", "Batteries (Primary and Secondary)", "Fuel Cells and Corrosion"]
          }
        ]
      },
      {
        name: "Chemical Kinetics",
        concepts: [
          {
            name: "Rate of Reaction",
            subConcepts: ["Average and Instantaneous Rates", "Factors Affecting Reaction Rate", "Order and Molecularity of a Reaction"]
          },
          {
            name: "Integrated Rate Equations",
            subConcepts: ["Zero Order Reaction Kinetics", "First Order Reaction Kinetics", "Half-life of a Reaction", "Activation Energy and Arrhenius Equation"]
          }
        ]
      },
      {
        name: "The d- and f-Block Elements",
        concepts: [
          {
            name: "d-Block Elements (Transition Metals)",
            subConcepts: ["General Characteristics and Electronic Configuration", "Variable Oxidation States", "Magnetic Properties and Colouration", "Interstitial Compounds", "Preparation of K2Cr2O7 and KMnO4"]
          },
          {
            name: "f-Block Elements (Inner Transition Metals)",
            subConcepts: ["Lanthanoid Contraction and Consequences", "Actinoids Characteristics"]
          }
        ]
      },
      {
        name: "Coordination Compounds",
        concepts: [
          {
            name: "Bonding in Coordination Compounds",
            subConcepts: ["Werner's Theory", "IUPAC Nomenclature of Coordination Complexes", "Isomerism in Coordination Compounds", "Valence Bond Theory (VBT) Complexes", "Crystal Field Theory (CFT) splitting in Octahedral and Tetrahedral fields"]
          }
        ]
      },
      {
        name: "Haloalkanes and Haloarenes",
        concepts: [
          {
            name: "Nucleophilic Substitution",
            subConcepts: ["SN1 Reaction Mechanism", "SN2 Reaction Mechanism", "Stereochemical aspects of SN reactions"]
          },
          {
            name: "Haloarenes Reactions",
            subConcepts: ["Electrophilic Substitution in Haloarenes", "Nucleophilic substitution limitations"]
          }
        ]
      },
      {
        name: "Alcohols, Phenols and Ethers",
        concepts: [
          {
            name: "Alcohols and Phenols",
            subConcepts: ["Preparation methods", "Acidic character of Phenols", "Esterification", "Lucas Test", "Reimer-Tiemann and Kolbe's reactions"]
          },
          {
            name: "Ethers",
            subConcepts: ["Williamson Synthesis", "Cleavage of Ethers by Halogen Acids"]
          }
        ]
      },
      {
        name: "Aldehydes, Ketones and Carboxylic Acids",
        concepts: [
          {
            name: "Aldehydes and Ketones",
            subConcepts: ["Nucleophilic Addition Reactions", "Aldol Condensation", "Cannizzaro Reaction", "Tollens' and Fehling's Tests"]
          },
          {
            name: "Carboxylic Acids",
            subConcepts: ["Acidity of Carboxylic Acids", "Hell-Volhard-Zelinsky (HVZ) Reaction", "Decarboxylation"]
          }
        ]
      },
      {
        name: "Amines",
        concepts: [
          {
            name: "Amines Chemistry",
            subConcepts: ["Basicity of Amines", "Gabriel Phthalimide Synthesis", "Hoffmann Bromamide Degradation", "Carbylamine Reaction", "Diazotization and Coupling Reactions"]
          }
        ]
      },
      {
        name: "Biomolecules",
        concepts: [
          {
            name: "Carbohydrates",
            subConcepts: ["Classification", "Structure of Glucose and Fructose", "Glycosidic Linkage (Sucrose, Starch, Cellulose)"]
          },
          {
            name: "Proteins and Nucleic Acids",
            subConcepts: ["Amino Acids (Essential & Non-essential)", "Peptide Bond and Protein Structure", "Denaturation of Proteins", "DNA and RNA Structures (Double Helix)"]
          }
        ]
      }
    ]
  },

  // ==================== MATHEMATICS CLASS 11 ====================
  {
    subjectName: "Mathematics",
    classNum: 11,
    chapters: [
      {
        name: "Sets",
        concepts: [
          {
            name: "Sets Operations",
            subConcepts: ["Types of Sets (Empty, Finite, Infinite)", "Subsets and Power Set", "Union and Intersection of Sets", "Venn Diagrams"]
          }
        ]
      },
      {
        name: "Relations and Functions",
        concepts: [
          {
            name: "Cartesian Products and Relations",
            subConcepts: ["Cartesian Product of Sets", "Domain, Codomain, and Range of Relation"]
          },
          {
            name: "Functions types",
            subConcepts: ["Real Valued Functions", "Polynomial, Rational, Modulus, Signum, and Greatest Integer Functions", "Domain and Range calculation"]
          }
        ]
      },
      {
        name: "Trigonometric Functions",
        concepts: [
          {
            name: "Trigonometric Ratios and Identities",
            subConcepts: ["Angles Measurement (Radian & Degree conversions)", "Signs of Trigonometric Functions", "Compound Angle Formulae", "Trigonometric Equations Solutions"]
          }
        ]
      },
      {
        name: "Complex Numbers and Quadratic Equations",
        concepts: [
          {
            name: "Complex Algebra",
            subConcepts: ["Algebraic Operations", "Argand Plane and Polar Representation", "Square Root of Complex Number", "Quadratic Equations in Complex System"]
          }
        ]
      },
      {
        name: "Linear Inequalities",
        concepts: [
          {
            name: "Linear Inequalities Systems",
            subConcepts: ["Algebraic solutions of linear inequalities in one variable", "Graphical solution of linear inequalities in two variables"]
          }
        ]
      },
      {
        name: "Permutations and Combinations",
        concepts: [
          {
            name: "Permutations and Combinations Theory",
            subConcepts: ["Fundamental Principle of Counting", "Factorial Notation", "nPr Formula & Applications", "nCr Formula & Applications"]
          }
        ]
      },
      {
        name: "Binomial Theorem",
        concepts: [
          {
            name: "Binomial Theorem Applications",
            subConcepts: ["Binomial Expansion for Positive Integral Index", "General and Middle Terms", "Binomial Coefficients Properties"]
          }
        ]
      },
      {
        name: "Sequences and Series",
        concepts: [
          {
            name: "Progression Sequences",
            subConcepts: ["Arithmetic Progression (AP) recap", "Geometric Progression (GP) General Term", "Sum of n terms of GP", "Infinite GP Sum", "Relation between AM and GM"]
          }
        ]
      },
      {
        name: "Straight Lines",
        concepts: [
          {
            name: "Lines Coordinates",
            subConcepts: ["Slope of a Line", "Various Forms of Equation of Line", "Distance of Point from a Line", "Angle between Two Lines"]
          }
        ]
      },
      {
        name: "Conic Sections",
        concepts: [
          {
            name: "Conics",
            subConcepts: ["Circle Standard Equation", "Parabola Standard Equations", "Ellipse Standard Equations", "Hyperbola Standard Equations"]
          }
        ]
      },
      {
        name: "Introduction to Three Dimensional Geometry",
        concepts: [
          {
            name: "3D Coordinates",
            subConcepts: ["Coordinate Axes and Planes", "Distance Formula in 3D Space", "Section Formula"]
          }
        ]
      },
      {
        name: "Limits and Derivatives",
        concepts: [
          {
            name: "Limits",
            subConcepts: ["Intuitive Idea of Limit", "Standard Limit Theorems", "Trigonometric Limits"]
          },
          {
            name: "Derivatives",
            subConcepts: ["Derivative at a Point", "First Principle of Differentiation", "Algebra of Derivatives (Product & Quotient Rules)"]
          }
        ]
      },
      {
        name: "Statistics",
        concepts: [
          {
            name: "Measures of Dispersion",
            subConcepts: ["Mean Deviation for grouped & ungrouped data", "Variance and Standard Deviation", "Coefficient of Variation"]
          }
        ]
      },
      {
        name: "Probability",
        concepts: [
          {
            name: "Classical Probability",
            subConcepts: ["Random Experiments & Sample Space", "Events (Mutually Exclusive & Exhaustive)", "Probability of an Event"]
          }
        ]
      }
    ]
  },

  // ==================== MATHEMATICS CLASS 12 ====================
  {
    subjectName: "Mathematics",
    classNum: 12,
    chapters: [
      {
        name: "Relations and Functions",
        concepts: [
          {
            name: "Types of Relations",
            subConcepts: ["Reflexive, Symmetric, and Transitive Relations", "Equivalence Relations", "Equivalence Classes"]
          },
          {
            name: "Types of Functions",
            subConcepts: ["One-one (Injective) Functions", "Onto (Surjective) Functions", "Bijective Functions", "Composition of Functions and Invertible Functions"]
          }
        ]
      },
      {
        name: "Inverse Trigonometric Functions",
        concepts: [
          {
            name: "Inverse Trigonometric Theory",
            subConcepts: ["Definition and Graphs of Inverse Trig Functions", "Principal Value Branches", "Properties of Inverse Trigonometric Functions"]
          }
        ]
      },
      {
        name: "Matrices",
        concepts: [
          {
            name: "Matrix Operations",
            subConcepts: ["Order and Types of Matrices", "Addition and Multiplication of Matrices", "Transpose of a Matrix", "Symmetric and Skew-symmetric Matrices"]
          },
          {
            name: "Elementary Operations",
            subConcepts: ["Invertible Matrices", "Inverse of Matrix by Elementary Row Operations"]
          }
        ]
      },
      {
        name: "Determinants",
        concepts: [
          {
            name: "Determinant Evaluation and Properties",
            subConcepts: ["Evaluation of Determinants up to 3x3", "Properties of Determinants", "Area of a Triangle using Determinants"]
          },
          {
            name: "Matrix Inverse and Applications",
            subConcepts: ["Minors and Cofactors", "Adjoint and Inverse of Matrix", "Solving System of Linear Equations using Matrix Method"]
          }
        ]
      },
      {
        name: "Continuity and Differentiability",
        concepts: [
          {
            name: "Continuity and Differentiability",
            subConcepts: ["Continuity check of functions", "Differentiability rules", "Chain Rule", "Implicit Differentiation", "Logarithmic Differentiation"]
          },
          {
            name: "Higher Order Derivatives",
            subConcepts: ["Second Order Derivatives", "Rolle's and Mean Value Theorems"]
          }
        ]
      },
      {
        name: "Application of Derivatives",
        concepts: [
          {
            name: "Rates and Tangents",
            subConcepts: ["Rate of Change of Quantities", "Increasing and Decreasing Functions", "Equations of Tangents and Normals", "Approximations"]
          },
          {
            name: "Maxima and Minima",
            subConcepts: ["First Derivative Test", "Second Derivative Test", "Applied Word Problems on Maxima and Minima"]
          }
        ]
      },
      {
        name: "Integrals",
        concepts: [
          {
            name: "Indefinite Integrals",
            subConcepts: ["Integration as Inverse Process of Differentiation", "Integration by Substitution", "Integration by Partial Fractions", "Integration by Parts"]
          },
          {
            name: "Definite Integrals",
            subConcepts: ["Definite Integral as Limit of Sum", "Fundamental Theorem of Calculus", "Properties of Definite Integrals"]
          }
        ]
      },
      {
        name: "Application of Integrals",
        concepts: [
          {
            name: "Area Under Curves",
            subConcepts: ["Area under simple curves (lines, parabolas, circles, ellipses)", "Area between two curves"]
          }
        ]
      },
      {
        name: "Differential Equations",
        concepts: [
          {
            name: "Differential Equations Basics",
            subConcepts: ["Order and Degree of Differential Equation", "General and Particular Solutions"]
          },
          {
            name: "Methods of Solution",
            subConcepts: ["Separable Variable Method", "Homogeneous Differential Equations", "Linear Differential Equations of First Order"]
          }
        ]
      },
      {
        name: "Vector Algebra",
        concepts: [
          {
            name: "Vector Algebra Basics",
            subConcepts: ["Direction Cosines and Direction Ratios", "Types of Vectors", "Addition and Components of Vector"]
          },
          {
            name: "Vector Products",
            subConcepts: ["Scalar (Dot) Product of Two Vectors", "Vector (Cross) Product of Two Vectors", "Scalar Triple Product"]
          }
        ]
      },
      {
        name: "Three Dimensional Geometry",
        concepts: [
          {
            name: "Line in Space",
            subConcepts: ["Direction Cosines & Ratios of Line", "Vector and Cartesian Equations of Line", "Angle between Two Lines", "Shortest Distance between Two Lines"]
          },
          {
            name: "Plane in Space",
            subConcepts: ["Vector and Cartesian Equations of Plane", "Angle between Two Planes", "Distance of Point from Plane"]
          }
        ]
      },
      {
        name: "Linear Programming",
        concepts: [
          {
            name: "LPP Formulation",
            subConcepts: ["Mathematical Formulation of LPP", "Graphical Method for Solving LPP (Bounded and Unbounded regions)"]
          }
        ]
      },
      {
        name: "Probability",
        concepts: [
          {
            name: "Conditional Probability and Bayes Theorem",
            subConcepts: ["Conditional Probability", "Multiplication Theorem", "Independent Events", "Bayes' Theorem"]
          },
          {
            name: "Random Variables",
            subConcepts: ["Probability Distribution of Random Variable", "Mean and Variance of Random Variable", "Bernoulli Trials and Binomial Distribution"]
          }
        ]
      }
    ]
  },

  // ==================== BOTANY CLASS 11 ====================
  {
    subjectName: "Botany",
    classNum: 11,
    chapters: [
      {
        name: "The Living World",
        concepts: [
          {
            name: "Taxonomy and Systematics",
            subConcepts: ["Binomial Nomenclature Rules", "Taxonomic Hierarchy", "Taxonomical Aids (Herbarium, Botanical Garden)"]
          }
        ]
      },
      {
        name: "Biological Classification",
        concepts: [
          {
            name: "Kingdoms Monera, Protista, Fungi",
            subConcepts: ["Archaebacteria and Eubacteria", "Chrysophytes, Dinoflagellates, Euglenoids", "Phycomycetes, Ascomycetes, Basidiomycetes", "Lichens and Mycorrhiza"]
          }
        ]
      },
      {
        name: "Plant Kingdom",
        concepts: [
          {
            name: "Algae and Bryophytes",
            subConcepts: ["Chlorophyceae, Phaeophyceae, Rhodophyceae", "Liverworts and Mosses Life Cycle"]
          },
          {
            name: "Pteridophytes, Gymnosperms, Angiosperms",
            subConcepts: ["Heterospory and Seed Habit", "Gymnosperms Characteristics", "Alternation of Generations (Haplontic, Diplontic)"]
          }
        ]
      },
      {
        name: "Anatomy of Flowering Plants",
        concepts: [
          {
            name: "Plant Tissues",
            subConcepts: ["Meristematic Tissues", "Simple Permanent Tissues (Parenchyma, Collenchyma, Sclerenchyma)", "Complex Permanent Tissues (Xylem, Phloem)"]
          },
          {
            name: "Tissue Systems and Secondary Growth",
            subConcepts: ["Epidermal, Ground, and Vascular Tissue Systems", "Dicot and Monocot Root/Stem/Leaf Anatomy", "Vascular Cambium and Cork Cambium Activity"]
          }
        ]
      },
      {
        name: "Cell: The Unit of Life",
        concepts: [
          {
            name: "Eukaryotic Cell Structure",
            subConcepts: ["Cell Wall and Cell Membrane", "Endomembrane System", "Mitochondria, Plastids, and Ribosomes", "Nucleus and Chromosomes Structure"]
          }
        ]
      },
      {
        name: "Photosynthesis in Higher Plants",
        concepts: [
          {
            name: "Light Reaction",
            subConcepts: ["Photosynthetic Pigments", "Photophosphorylation (Cyclic & Non-cyclic)", "Chemiosmotic Hypothesis"]
          },
          {
            name: "Dark Reaction",
            subConcepts: ["C3 Cycle (Calvin Cycle)", "C4 Cycle (Hatch-Slack Pathway)", "Photorespiration", "Factors Affecting Photosynthesis"]
          }
        ]
      },
      {
        name: "Respiration in Plants",
        concepts: [
          {
            name: "Cellular Respiration Pathways",
            subConcepts: ["Glycolysis (EMP Pathway)", "TCA Cycle (Krebs Cycle)", "Electron Transport System (ETS)", "Oxidative Phosphorylation", "Respiratory Quotient"]
          }
        ]
      },
      {
        name: "Plant Growth and Development",
        concepts: [
          {
            name: "Plant Growth Regulators",
            subConcepts: ["Auxins, Gibberellins, Cytokinins", "Ethylene and Abscisic Acid (ABA) Actions", "Photoperiodism and Vernalisation"]
          }
        ]
      }
    ]
  },

  // ==================== BOTANY CLASS 12 ====================
  {
    subjectName: "Botany",
    classNum: 12,
    chapters: [
      {
        name: "Sexual Reproduction in Flowering Plants",
        concepts: [
          {
            name: "Pre-fertilisation structures",
            subConcepts: ["Microsporogenesis and Pollen Grain", "Megasporogenesis and Embryo Sac", "Pollination Agencies and Outbreeding Devices"]
          },
          {
            name: "Double Fertilisation and Post-fertilisation",
            subConcepts: ["Endosperm and Embryo Development", "Seed and Fruit Formation", "Apomixis and Polyembryony"]
          }
        ]
      },
      {
        name: "Principles of Inheritance and Variation",
        concepts: [
          {
            name: "Mendelian Genetics",
            subConcepts: ["Monohybrid Cross Laws", "Dihybrid Cross Law of Independent Assortment", "Incomplete Dominance and Co-dominance"]
          },
          {
            name: "Chromosomal Theory and Linkage",
            subConcepts: ["Chromosomal Theory of Inheritance", "Linkage and Recombination", "Polygenic Inheritance and Pleiotropy"]
          }
        ]
      },
      {
        name: "Molecular Basis of Inheritance",
        concepts: [
          {
            name: "DNA Structure and Replication",
            subConcepts: ["DNA Double Helix Model", "Nucleosome Structure", "Hershey-Chase Experiment", "Semi-conservative DNA Replication Mechanism"]
          },
          {
            name: "Gene Expression and Regulation",
            subConcepts: ["Transcription in Prokaryotes & Eukaryotes", "Genetic Code Properties", "Translation Mechanism", "Lac Operon System", "Human Genome Project (HGP) Goals"]
          }
        ]
      },
      {
        name: "Biotechnology: Principles and Processes",
        concepts: [
          {
            name: "Recombinant DNA Technology Tools",
            subConcepts: ["Restriction Enzymes", "Cloning Vectors (pBR322)", "Competent Host Transformation"]
          },
          {
            name: "rDNA Processes",
            subConcepts: ["Isolation of DNA", "Polymerase Chain Reaction (PCR)", "Bioreactors operation"]
          }
        ]
      },
      {
        name: "Biotechnology and its Applications",
        concepts: [
          {
            name: "Biotech in Agriculture",
            subConcepts: ["Bt Cotton details", "RNA Interference (RNAi) in Tobacco plants", "Transgenic Crops"]
          }
        ]
      },
      {
        name: "Organisms and Populations",
        concepts: [
          {
            name: "Organism Adaptations",
            subConcepts: ["Major Abiotic Factors Response", "Adaptations in Plants and Animals"]
          },
          {
            name: "Population Growth and Interactions",
            subConcepts: ["Population Attributes", "Growth Models (Exponential & Logistic)", "Interactions (Mutualism, Parasitism, Commensalism)"]
          }
        ]
      },
      {
        name: "Ecosystem",
        concepts: [
          {
            name: "Ecosystem Structure and Function",
            subConcepts: ["Productivity (GPP, NPP)", "Decomposition Stages", "Energy Flow (Food Chain, Food Web, Ecological Pyramids)"]
          },
          {
            name: "Biogeochemical Cycles",
            subConcepts: ["Carbon Cycle", "Phosphorus Cycle", "Ecological Succession Phases"]
          }
        ]
      },
      {
        name: "Biodiversity and Conservation",
        concepts: [
          {
            name: "Biodiversity Patterns",
            subConcepts: ["Species-Area Relationship", "Importance of Biodiversity", "Loss of Biodiversity Causes"]
          },
          {
            name: "Conservation Methods",
            subConcepts: ["In-situ Conservation (National Parks, Biosphere Reserves)", "Ex-situ Conservation (Botanical Gardens, Cryopreservation)"]
          }
        ]
      }
    ]
  },

  // ==================== ZOOLOGY CLASS 11 ====================
  {
    subjectName: "Zoology",
    classNum: 11,
    chapters: [
      {
        name: "Animal Kingdom",
        concepts: [
          {
            name: "Basis of Classification",
            subConcepts: ["Levels of Organisation", "Symmetry, Coelom, Segmentation", "Notochord presence"]
          },
          {
            name: "Invertebrate Phyla",
            subConcepts: ["Porifera, Coelenterata, Ctenophora", "Platyhelminthes, Aschelminthes", "Annelida, Arthropoda, Mollusca, Echinodermata"]
          },
          {
            name: "Phylum Chordata",
            subConcepts: ["Urochordata & Cephalochordata", "Cyclostomata", "Chondrichthyes and Osteichthyes", "Amphibia, Reptilia, Aves, Mammalia"]
          }
        ]
      },
      {
        name: "Structural Organisation in Animals",
        concepts: [
          {
            name: "Animal Tissues",
            subConcepts: ["Epithelial Tissue Types", "Connective Tissue (Loose, Dense, Specialized)", "Muscle Tissue and Neural Tissue"]
          },
          {
            name: "Cockroach Anatomy",
            subConcepts: ["Morphology", "Digestive and Circulatory Systems", "Reproductive System of Cockroach"]
          }
        ]
      },
      {
        name: "Biomolecules (Zoology Focus)",
        concepts: [
          {
            name: "Enzymes",
            subConcepts: ["Chemical Reactions Rate", "Mechanism of Enzyme Action", "Factors Affecting Enzyme Activity", "Classification and Nomenclature of Enzymes", "Co-factors"]
          }
        ]
      },
      {
        name: "Breathing and Exchange of Gases",
        concepts: [
          {
            name: "Human Respiratory System",
            subConcepts: ["Mechanism of Breathing", "Respiratory Volumes and Capacities", "Exchange and Transport of Gases (O2 and CO2)", "Regulation of Respiration", "Respiratory Disorders (Asthma, Emphysema)"]
          }
        ]
      },
      {
        name: "Body Fluids and Circulation",
        concepts: [
          {
            name: "Blood and Lymph",
            subConcepts: ["Formed Elements", "Blood Groups (ABO & Rh)", "Coagulation of Blood", "Lymph Structure"]
          },
          {
            name: "Human Circulatory System",
            subConcepts: ["Structure of Human Heart", "Cardiac Cycle and ECG", "Double Circulation", "Regulation of Cardiac Activity", "Circulatory Disorders (Hypertension, CAD, Heart Failure)"]
          }
        ]
      },
      {
        name: "Excretory Products and their Elimination",
        concepts: [
          {
            name: "Urine Formation",
            subConcepts: ["Glomerular Filtration", "Reabsorption and Secretion", "Counter Current Mechanism in Henle's Loop"]
          },
          {
            name: "Regulation of Kidney Function",
            subConcepts: ["Renin-Angiotensin System", "ADH and ANF Mechanisms", "Micturition", "Dialysis and Kidney Transplantation"]
          }
        ]
      },
      {
        name: "Locomotion and Movement",
        concepts: [
          {
            name: "Muscle Contraction",
            subConcepts: ["Structure of Contractile Proteins (Actin & Myosin)", "Sliding Filament Theory", "Skeletal System structure"]
          },
          {
            name: "Joints and Muscle Disorders",
            subConcepts: ["Fibrous, Cartilaginous, and Synovial Joints", "Myasthenia Gravis, Tetany, Muscular Dystrophy, Arthritis, Osteoporosis, Gout"]
          }
        ]
      },
      {
        name: "Neural Control and Coordination",
        concepts: [
          {
            name: "Nervous System and Impulse",
            subConcepts: ["Structure of Neuron", "Generation and Conduction of Nerve Impulse", "Synaptic Transmission"]
          },
          {
            name: "Central Nervous System & Reflexes",
            subConcepts: ["Brain Parts (Forebrain, Midbrain, Hindbrain)", "Reflex Action", "Structure of Eye and Ear"]
          }
        ]
      },
      {
        name: "Chemical Coordination and Integration",
        concepts: [
          {
            name: "Endocrine Glands and Hormones",
            subConcepts: ["Hypothalamus and Pituitary Hormones", "Thyroid, Parathyroid, Adrenal Glands", "Pancreas, Testis, Ovary", "Mechanism of Hormone Action (Peptide & Steroid)"]
          }
        ]
      }
    ]
  },

  // ==================== ZOOLOGY CLASS 12 ====================
  {
    subjectName: "Zoology",
    classNum: 12,
    chapters: [
      {
        name: "Human Reproduction",
        concepts: [
          {
            name: "Male and Female Reproductive Systems",
            subConcepts: ["Anatomy of Testis & Accessory Ducts", "Anatomy of Ovary & Fallopian Tubes", "Gametogenesis (Spermatogenesis & Oogenesis)"]
          },
          {
            name: "Menstrual Cycle and Fertilisation",
            subConcepts: ["Hormonal Regulation of Menstrual Cycle", "Cleavage and Blastocyst formation", "Implantation", "Pregnancy and Placenta formation", "Parturition and Lactation"]
          }
        ]
      },
      {
        name: "Reproductive Health",
        concepts: [
          {
            name: "Population Stabilisation and Contraception",
            subConcepts: ["Natural, Barrier, IUDs, Oral Contraceptives", "Surgical Methods (Vasectomy, Tubectomy)", "Medical Termination of Pregnancy (MTP)"]
          },
          {
            name: "Sexually Transmitted Diseases & Infertility",
            subConcepts: ["STIs Symptoms and Prevention", "Assisted Reproductive Technologies (ART - IVF, ZIFT, GIFT, ICSI)"]
          }
        ]
      },
      {
        name: "Evolution",
        concepts: [
          {
            name: "Origin of Life and Evidence",
            subConcepts: ["Oparin-Haldane Theory & Miller's Experiment", "Palaeontological and Anatomical Evidence (Homologous & Analogous)", "Adaptive Radiation (Darwin's Finches)"]
          },
          {
            name: "Evolutionary Mechanisms",
            subConcepts: ["Darwinian Theory & Mutation Theory", "Hardy-Weinberg Principle", "Human Evolution Stages"]
          }
        ]
      },
      {
        name: "Human Health and Disease",
        concepts: [
          {
            name: "Common Diseases in Humans",
            subConcepts: ["Bacterial, Viral, Protozoan Diseases (Malaria Life Cycle)", "Fungal and Helminthic Diseases"]
          },
          {
            name: "Immunity and Health Issues",
            subConcepts: ["Innate and Acquired Immunity", "Humoral and Cell-Mediated Immune Responses", "AIDS and Cancer pathogenesis", "Drug and Alcohol Abuse"]
          }
        ]
      },
      {
        name: "Biotechnology Applications (Zoology Focus)",
        concepts: [
          {
            name: "Biotech in Medicine",
            subConcepts: ["Genetically Engineered Insulin (Humulin)", "Gene Therapy (ADA deficiency)", "Molecular Diagnosis (PCR, ELISA)", "Transgenic Animals", "Ethical Issues and Biopiracy"]
          }
        ]
      }
    ]
  }
];

module.exports = ncertSyllabus;
